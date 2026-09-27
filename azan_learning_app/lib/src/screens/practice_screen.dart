import 'dart:async';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';

import '../localization/app_strings.dart';
import '../models/azan.dart';
import '../state/app_controller.dart';

class PracticeScreen extends StatefulWidget {
  const PracticeScreen({
    super.key,
    required this.entry,
    required this.controller,
  });
  final AzanEntry entry;
  final AppController controller;

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _player = AudioPlayer();
  int _phraseIndex = 0;
  bool _recording = false;
  String? _recordingPath;
  String? _recordingPlaybackPath;
  bool _playingRecording = false;
  int _seconds = 0;
  Timer? _timer;
  StreamSubscription<PlayerState>? _playerStateSubscription;

  AppStrings get s => AppStrings(widget.controller.languageCode);
  AzanPhrase get phrase => widget.entry.phrases[_phraseIndex];

  @override
  void initState() {
    super.initState();
    _playerStateSubscription = _player.playerStateStream.listen((state) {
      if (!mounted) return;
      if (state.processingState == ProcessingState.completed) {
        setState(() {
          _recordingPlaybackPath = null;
          _playingRecording = false;
        });
        return;
      }
      final playing =
          _recordingPlaybackPath != null &&
          state.playing &&
          state.processingState != ProcessingState.idle;
      if (_playingRecording != playing) {
        setState(() => _playingRecording = playing);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _playerStateSubscription?.cancel();
    _recorder.dispose();
    _player.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    await _player.stop();
    if (!await _recorder.hasPermission()) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(s.t('permission'))));
      }
      return;
    }
    final directory = await getApplicationDocumentsDirectory();
    final path =
        '${directory.path}/practice_${widget.entry.id}_${_phraseIndex}_${DateTime.now().millisecondsSinceEpoch}.m4a';
    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
      ),
      path: path,
    );
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _seconds++);
    });
    setState(() {
      _recording = true;
      _recordingPath = null;
      _recordingPlaybackPath = null;
      _playingRecording = false;
      _seconds = 0;
    });
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stop();
    _timer?.cancel();
    await widget.controller.recordAttempt(
      path: path,
      azanId: widget.entry.id,
      azanName: _entryTitle(widget.entry),
      phrase: phrase.transliteration,
      phraseIndex: _phraseIndex,
    );
    if (mounted) {
      setState(() {
        _recording = false;
        _recordingPath = path;
      });
    }
  }

  Future<void> _playRecording() async {
    final path = _recordingPath;
    if (path == null) return;
    if (_recordingPlaybackPath == path && _player.playing) {
      await _player.pause();
      if (mounted) setState(() => _playingRecording = false);
      return;
    }
    if (_recordingPlaybackPath != path) {
      await _player.setFilePath(path);
    }
    if (mounted) {
      setState(() {
        _recordingPlaybackPath = path;
        _playingRecording = true;
      });
    }
    await _player.play();
  }

  Future<void> _next() async {
    await _player.stop();
    if (_phraseIndex == widget.entry.phrases.length - 1) {
      await widget.controller.completeSession();
      if (!mounted) return;
      await Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => CompletionScreen(
            entry: widget.entry,
            controller: widget.controller,
          ),
        ),
      );
      return;
    }
    setState(() {
      _phraseIndex++;
      _recordingPath = null;
      _recordingPlaybackPath = null;
      _playingRecording = false;
      _seconds = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;
    final total = widget.entry.phrases.length;
    final phrasePracticeCount = widget.controller.phrasePracticeCount(
      widget.entry.id,
      _phraseIndex,
    );
    final translation = widget.controller.languageCode == 'ur'
        ? phrase.urdu
        : phrase.english;
    return Scaffold(
      appBar: AppBar(
        title: Text('${s.t('phrase')} ${_phraseIndex + 1} ${s.t('of')} $total'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            LinearProgressIndicator(
              value: (_phraseIndex + 1) / total,
              minHeight: 5,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(18),
                child: Column(
                  children: [
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 22,
                        ),
                        child: Column(
                          children: [
                            _PhraseCounter(
                              value: phrasePracticeCount,
                              color: colors.primary,
                            ),
                            const SizedBox(height: 18),
                            Text(
                              phrase.arabic,
                              textDirection: TextDirection.rtl,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontFamily: 'serif',
                                fontSize: 32,
                                fontWeight: FontWeight.w700,
                                height: 1.8,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              phrase.transliteration,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontStyle: FontStyle.italic,
                                color: colors.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(height: 7),
                            Text(
                              translation,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 15, height: 1.5),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Card(
                      color: colors.primaryContainer.withValues(alpha: .55),
                      child: ListTile(
                        leading: IconButton.filledTonal(
                          onPressed: phrase.referenceAudioUrl == null
                              ? null
                              : () async {
                                  await _player.setUrl(
                                    phrase.referenceAudioUrl!,
                                  );
                                  await _player.play();
                                },
                          icon: const Icon(Icons.play_arrow),
                        ),
                        title: Text(
                          s.t('reference'),
                          style: const TextStyle(fontWeight: FontWeight.w800),
                        ),
                        subtitle: Text(
                          phrase.referenceAudioUrl == null
                              ? s.t('audioPending')
                              : phrase.transliteration,
                        ),
                      ),
                    ),
                    const SizedBox(height: 26),
                    GestureDetector(
                      onTap: _recording ? _stopRecording : _startRecording,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 104,
                        height: 104,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _recording
                              ? colors.error
                              : const Color(0xFFC13D31),
                          boxShadow: [
                            BoxShadow(
                              color: colors.error.withValues(alpha: .25),
                              blurRadius: _recording ? 25 : 12,
                              spreadRadius: _recording ? 9 : 3,
                            ),
                          ],
                        ),
                        child: Icon(
                          _recording ? Icons.stop_rounded : Icons.mic_rounded,
                          color: Colors.white,
                          size: 46,
                        ),
                      ),
                    ),
                    const SizedBox(height: 13),
                    Text(
                      _recording
                          ? '${s.t('recording')} 0:${_seconds.toString().padLeft(2, '0')}'
                          : s.t('record'),
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    if (_recordingPath != null) ...[
                      const SizedBox(height: 22),
                      OutlinedButton.icon(
                        onPressed: _playRecording,
                        icon: Icon(
                          _playingRecording ? Icons.pause : Icons.play_arrow,
                        ),
                        label: Text(
                          _playingRecording
                              ? s.t('pauseMine')
                              : s.t('playMine'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: FilledButton(
                onPressed: _recordingPath == null ? null : _next,
                child: Text(
                  _phraseIndex == total - 1 ? s.t('finish') : s.t('next'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _entryTitle(AzanEntry entry) => widget.controller.languageCode == 'ur'
      ? entry.titleUrdu
      : widget.controller.languageCode == 'ar'
      ? entry.titleArabic
      : entry.title;
}

class CompletionScreen extends StatelessWidget {
  const CompletionScreen({
    super.key,
    required this.entry,
    required this.controller,
  });
  final AzanEntry entry;
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final s = AppStrings(controller.languageCode);
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 110,
                height: 110,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: colors.primaryContainer,
                ),
                child: Icon(
                  Icons.check_rounded,
                  color: colors.primary,
                  size: 64,
                ),
              ),
              const SizedBox(height: 30),
              Text(
                s.t('complete'),
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                s.t('wellDone'),
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  height: 1.5,
                  color: colors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 36),
              FilledButton(
                onPressed: () => Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (_) =>
                        PracticeScreen(entry: entry, controller: controller),
                  ),
                ),
                child: Text(s.t('practiceAgain')),
              ),
              const SizedBox(height: 10),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text(s.t('done')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PhraseCounter extends StatelessWidget {
  const _PhraseCounter({required this.value, required this.color});

  final int value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 76,
      height: 76,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 76,
            height: 76,
            child: CircularProgressIndicator(
              value: value / 10,
              strokeWidth: 7,
              strokeCap: StrokeCap.round,
              backgroundColor: color.withValues(alpha: .14),
              color: color,
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '$value',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: color,
                ),
              ),
              Text(
                '/10',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
