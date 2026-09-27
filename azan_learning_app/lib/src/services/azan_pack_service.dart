import 'dart:io';

import 'package:archive/archive.dart';
import 'package:archive/archive_io.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import '../models/azan.dart';

typedef DownloadProgress = void Function(double? value);

class AzanPackService {
  Future<String?> localPath(AzanEntry entry, AzanAudioType type) async {
    final directory = await _packDirectory(entry);
    final file = File(
      '${directory.path}${Platform.pathSeparator}${_fileName(entry, type)}',
    );
    return await file.exists() ? file.path : null;
  }

  Future<String> ensureAudio(
    AzanEntry entry,
    AzanAudioType type, {
    DownloadProgress? onProgress,
  }) async {
    if (!entry.availableAudio.contains(type)) {
      throw const FormatException(
        'This audio is not included in the selected pack.',
      );
    }
    final existing = await localPath(entry, type);
    if (existing != null) return existing;

    await _downloadAndExtract(entry, onProgress: onProgress);
    final downloaded = await localPath(entry, type);
    if (downloaded == null) {
      throw const FormatException(
        'The requested audio file was missing from the downloaded ZIP.',
      );
    }
    return downloaded;
  }

  Future<Directory> _packDirectory(AzanEntry entry) async {
    final support = await getApplicationSupportDirectory();
    return Directory(
      '${support.path}${Platform.pathSeparator}azan_packs${Platform.pathSeparator}${entry.id}',
    );
  }

  Future<void> _downloadAndExtract(
    AzanEntry entry, {
    DownloadProgress? onProgress,
  }) async {
    final directory = await _packDirectory(entry);
    await directory.create(recursive: true);
    final zipFile = File(
      '${directory.path}${Platform.pathSeparator}download.part',
    );
    final client = http.Client();
    IOSink? sink;
    try {
      final request = http.Request('GET', Uri.parse(entry.downloadUrl));
      final response = await client.send(request);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw HttpException(
          'Download failed with HTTP ${response.statusCode}.',
        );
      }
      final total = response.contentLength;
      var received = 0;
      sink = zipFile.openWrite();
      await for (final chunk in response.stream) {
        sink.add(chunk);
        received += chunk.length;
        onProgress?.call(total == null || total == 0 ? null : received / total);
      }
      await sink.flush();
      await sink.close();
      sink = null;

      final input = InputFileStream(zipFile.path);
      final archive = ZipDecoder().decodeStream(input);
      final expected = AzanAudioType.values
          .map((type) => _fileName(entry, type).toLowerCase())
          .toSet();
      for (final archivedFile in archive) {
        if (!archivedFile.isFile || archivedFile.isSymbolicLink) continue;
        final basename = archivedFile.name.split(RegExp(r'[/\\]')).last;
        if (!expected.contains(basename.toLowerCase())) continue;
        final output = OutputFileStream(
          '${directory.path}${Platform.pathSeparator}$basename',
        );
        archivedFile.writeContent(output);
        output.closeSync();
      }
      input.closeSync();
      archive.clearSync();
      onProgress?.call(1);
    } finally {
      await sink?.close();
      client.close();
      if (await zipFile.exists()) await zipFile.delete();
    }
  }

  String _fileName(AzanEntry entry, AzanAudioType type) => switch (type) {
    AzanAudioType.takbeer => '${entry.archivePrefix}.mp3',
    AzanAudioType.call => '${entry.archivePrefix}-call.mp3',
    AzanAudioType.full => '${entry.archivePrefix}-full.mp3',
    AzanAudioType.fajr => '${entry.archivePrefix}-full-fajr.mp3',
  };
}
