import 'dart:io';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:share_plus/share_plus.dart';

import '../localization/app_strings.dart';
import '../state/app_controller.dart';

class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key, required this.controller});
  final AppController controller;

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen> {
  final AudioPlayer _player = AudioPlayer();
  String? _playingPath;

  AppController get controller => widget.controller;

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _playRecording(PracticeRecording recording) async {
    if (!File(recording.path).existsSync()) {
      if (mounted) {
        final s = AppStrings(controller.languageCode);
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(s.t('missingRecording'))));
      }
      return;
    }
    if (_playingPath == recording.path && _player.playing) {
      await _player.pause();
      return;
    }
    await _player.setFilePath(recording.path);
    if (mounted) {
      setState(() => _playingPath = recording.path);
    }
    await _player.play();
  }

  Future<void> _shareRecording(
    BuildContext shareContext,
    PracticeRecording recording,
  ) async {
    final s = AppStrings(controller.languageCode);
    if (!File(recording.path).existsSync()) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(s.t('missingRecording'))));
      }
      return;
    }
    final box = shareContext.findRenderObject() as RenderBox?;
    await SharePlus.instance.share(
      ShareParams(
        files: [XFile(recording.path, mimeType: 'audio/mp4')],
        fileNameOverrides: ['${recording.azanId}-practice.m4a'],
        subject: recording.azanName,
        text: '${s.t('recordedFor')} ${recording.azanName}',
        sharePositionOrigin: box == null
            ? null
            : box.localToGlobal(Offset.zero) & box.size,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = AppStrings(controller.languageCode);
    final colors = Theme.of(context).colorScheme;
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const SizedBox(height: 12),
        Text(
          s.t('progress'),
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 22),
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                icon: Icons.mic,
                value: controller.practiceAttempts,
                label: s.t('attempts'),
                color: colors.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricCard(
                icon: Icons.task_alt,
                value: controller.completedSessions,
                label: s.t('completed'),
                color: colors.tertiary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.auto_graph, color: colors.primary),
                    const SizedBox(width: 10),
                    Text(
                      s.t('progress'),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 17,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                LinearProgressIndicator(
                  value: (controller.practiceAttempts % 10) / 10,
                  minHeight: 10,
                  borderRadius: BorderRadius.circular(10),
                ),
                const SizedBox(height: 10),
                Text(
                  '${controller.practiceAttempts % 10} / 10',
                  style: TextStyle(color: colors.onSurfaceVariant),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          s.t('myRecordings'),
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: 10),
        if (controller.recordings.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Text(
                s.t('noRecordings'),
                style: TextStyle(color: colors.onSurfaceVariant),
              ),
            ),
          )
        else
          ...controller.recordings.map(
            (recording) => _RecordingTile(
              recording: recording,
              playing: _playingPath == recording.path && _player.playing,
              onPlay: () => _playRecording(recording),
              onShare: (shareContext) =>
                  _shareRecording(shareContext, recording),
              recordedForLabel: s.t('recordedFor'),
              shareLabel: s.t('shareRecording'),
            ),
          ),
      ],
    );
  }
}

class _RecordingTile extends StatelessWidget {
  const _RecordingTile({
    required this.recording,
    required this.playing,
    required this.onPlay,
    required this.onShare,
    required this.recordedForLabel,
    required this.shareLabel,
  });

  final PracticeRecording recording;
  final bool playing;
  final VoidCallback onPlay;
  final ValueChanged<BuildContext> onShare;
  final String recordedForLabel;
  final String shareLabel;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: IconButton.filledTonal(
          onPressed: onPlay,
          icon: Icon(playing ? Icons.pause : Icons.play_arrow),
        ),
        title: Text(
          recording.azanName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Text(
          '$recordedForLabel ${recording.phrase}',
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Builder(
          builder: (context) => IconButton(
            tooltip: shareLabel,
            onPressed: () => onShare(context),
            icon: Icon(Icons.share_outlined, color: colors.primary),
          ),
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });
  final IconData icon;
  final int value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: color.withValues(alpha: .13),
            foregroundColor: color,
            child: Icon(icon),
          ),
          const SizedBox(height: 20),
          Text(
            '$value',
            style: Theme.of(
              context,
            ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    ),
  );
}
