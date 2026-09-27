import 'dart:async';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import '../localization/app_strings.dart';
import '../models/azan.dart';
import '../services/azan_pack_service.dart';
import '../state/app_controller.dart';
import 'practice_screen.dart';

class DetailScreen extends StatefulWidget {
  const DetailScreen({
    super.key,
    required this.entry,
    required this.controller,
  });
  final AzanEntry entry;
  final AppController controller;

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen>
    with SingleTickerProviderStateMixin {
  final AudioPlayer _player = AudioPlayer();
  final AzanPackService _packs = AzanPackService();
  final Set<AzanAudioType> _downloaded = {};
  late final AnimationController _waveController;
  AzanAudioType? _activeType;
  AzanAudioType? _loadingType;
  double? _downloadProgress;
  int _listenRequestId = 0;
  StreamSubscription<PlayerState>? _playerStateSubscription;

  AppStrings get s => AppStrings(widget.controller.languageCode);

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _loadDownloadStatus();
    _playerStateSubscription = _player.playerStateStream.listen((state) {
      if (state.processingState == ProcessingState.completed && mounted) {
        setState(() {
          _activeType = null;
          _loadingType = null;
          _downloadProgress = null;
        });
      }
    });
  }

  Future<void> _loadDownloadStatus() async {
    final available = <AzanAudioType>{};
    for (final type in widget.entry.availableAudio) {
      if (await _packs.localPath(widget.entry, type) != null) {
        available.add(type);
      }
    }
    if (mounted) {
      setState(() {
        _downloaded
          ..clear()
          ..addAll(available);
      });
    }
  }

  @override
  void dispose() {
    _playerStateSubscription?.cancel();
    _waveController.dispose();
    _player.dispose();
    super.dispose();
  }

  Future<void> _listen(AzanAudioType type) async {
    if (!_downloaded.contains(type)) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(s.t('downloadFirst'))));
      return;
    }
    if (_activeType == type && _player.playing) {
      await _player.pause();
      return;
    }
    if (_activeType == type &&
        _loadingType == null &&
        _player.duration != null) {
      await _player.play();
      return;
    }
    final requestId = ++_listenRequestId;
    await _player.stop();
    setState(() {
      _activeType = type;
      _loadingType = type;
      _downloadProgress = null;
    });
    try {
      final path = await _packs.localPath(widget.entry, type);
      if (!mounted || requestId != _listenRequestId) return;
      if (path == null) {
        await _loadDownloadStatus();
        if (!mounted || requestId != _listenRequestId) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(s.t('downloadFirst'))));
        return;
      }
      await _player.setFilePath(path);
      if (mounted && requestId == _listenRequestId) {
        setState(() => _activeType = type);
      }
      if (requestId != _listenRequestId) return;
      await _player.play();
    } catch (error) {
      if (mounted && requestId == _listenRequestId) {
        setState(() => _activeType = null);
      }
      if (mounted && requestId == _listenRequestId) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${s.t('downloadFailed')} $error')),
        );
      }
    } finally {
      if (mounted && requestId == _listenRequestId) {
        setState(() {
          _loadingType = null;
          _downloadProgress = null;
        });
      }
    }
  }

  Future<void> _downloadAudio(AzanAudioType type) async {
    if (_downloaded.contains(type) || _loadingType == type) return;
    final requestId = ++_listenRequestId;
    await _player.stop();
    setState(() {
      _activeType = null;
      _loadingType = type;
      _downloadProgress = 0;
    });
    try {
      await _packs.ensureAudio(
        widget.entry,
        type,
        onProgress: (value) {
          if (mounted && requestId == _listenRequestId) {
            setState(() => _downloadProgress = value);
          }
        },
      );
      if (!mounted || requestId != _listenRequestId) return;
      await _loadDownloadStatus();
    } catch (error) {
      if (mounted && requestId == _listenRequestId) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${s.t('downloadFailed')} $error')),
        );
      }
    } finally {
      if (mounted && requestId == _listenRequestId) {
        setState(() {
          _loadingType = null;
          _downloadProgress = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final entry = widget.entry;
    final colors = Theme.of(context).colorScheme;
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar.large(
            expandedHeight: 190,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                _title(entry),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image(
                    image: ResizeImage(_entryImageSource(entry), width: 720),
                    fit: BoxFit.cover,
                    filterQuality: FilterQuality.low,
                    errorBuilder: (_, _, _) => Container(
                      color: colors.primary,
                      child: const Icon(
                        Icons.mosque,
                        size: 80,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.transparent, Color(0xD9000000)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(18),
            sliver: SliverList.list(
              children: [
                _muazzinDetailsCard(entry),
                const SizedBox(height: 12),
                StreamBuilder<Duration>(
                  stream: _player.positionStream,
                  builder: (context, snapshot) => Column(
                    children: widget.entry.availableAudio
                        .map((type) => _audioTile(type, snapshot.data))
                        .toList(),
                  ),
                ),
                const SizedBox(height: 20),
                FilledButton.icon(
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => PracticeScreen(
                        entry: entry,
                        controller: widget.controller,
                      ),
                    ),
                  ),
                  icon: const Icon(Icons.mic),
                  label: Text(s.t('practice')),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _audioTile(AzanAudioType type, Duration? position) {
    final loading = _loadingType == type;
    final downloaded = _downloaded.contains(type);
    final downloading = loading && !downloaded;
    final selected = _activeType == type;
    final playing = selected && (_player.playing || loading);
    final duration = selected ? _player.duration : null;
    final progress = _playerProgress(type, position, duration);
    final seekable = selected && duration != null && !downloading;
    final colors = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: colors.surfaceContainerHighest.withValues(alpha: .55),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 9, 12, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _audioLabel(type),
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 7),
            Row(
              children: [
                IconButton.filled(
                  style: IconButton.styleFrom(
                    backgroundColor: downloaded
                        ? colors.primary
                        : colors.surfaceContainerHighest,
                    foregroundColor: downloaded
                        ? colors.onPrimary
                        : colors.onSurfaceVariant,
                    fixedSize: const Size.square(40),
                    minimumSize: const Size.square(40),
                    padding: EdgeInsets.zero,
                  ),
                  onPressed: () => _listen(type),
                  icon: Icon(playing ? Icons.pause : Icons.play_arrow),
                ),
                const SizedBox(width: 10),
                Text(
                  _formatDuration(selected ? position : Duration.zero),
                  style: TextStyle(
                    fontSize: 12,
                    color: colors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: seekable
                      ? SliderTheme(
                          data: SliderTheme.of(context).copyWith(
                            trackHeight: 5,
                            thumbShape: const RoundSliderThumbShape(
                              enabledThumbRadius: 6,
                            ),
                            overlayShape: const RoundSliderOverlayShape(
                              overlayRadius: 14,
                            ),
                          ),
                          child: Slider(
                            value: _sliderValue(position, duration),
                            min: 0,
                            max: duration.inMilliseconds.toDouble(),
                            onChanged: (value) {
                              _player.seek(
                                Duration(milliseconds: value.round()),
                              );
                            },
                          ),
                        )
                      : ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: progress,
                            minHeight: 5,
                            backgroundColor: colors.surface,
                            color: colors.primary,
                          ),
                        ),
                ),
                const SizedBox(width: 8),
                Text(
                  _formatDuration(duration),
                  style: TextStyle(
                    fontSize: 12,
                    color: colors.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 10),
                if (downloaded)
                  _AudioLayerIndicator(
                    animation: _waveController,
                    active: selected && _player.playing,
                    color: colors.primary,
                  )
                else
                  IconButton(
                    tooltip: s.t('downloadAudio'),
                    onPressed: downloading ? null : () => _downloadAudio(type),
                    icon: downloading
                        ? SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              value: _downloadProgress == 0
                                  ? null
                                  : _downloadProgress,
                              strokeWidth: 2.4,
                            ),
                          )
                        : Icon(
                            Icons.download_outlined,
                            color: colors.primary,
                            size: 26,
                          ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _muazzinDetailsCard(AzanEntry entry) {
    final colors = Theme.of(context).colorScheme;
    final muazzin = entry.muazzin;
    final location = [
      muazzin.city,
      muazzin.country,
    ].where((value) => value.trim().isNotEmpty).join(', ');
    return Card(
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        initiallyExpanded: false,
        leading: Icon(Icons.person_outline, color: colors.primary),
        title: Text(
          s.t('muazzinDetails'),
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Text(_reciterName(muazzin)),
        childrenPadding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
        children: [
          _DetailLine(label: s.t('reciter'), value: _reciterName(muazzin)),
          _DetailLine(
            label: s.t('mosque'),
            value: widget.controller.languageCode == 'ur'
                ? muazzin.mosqueUrdu
                : muazzin.mosque,
          ),
          if (location.isNotEmpty)
            _DetailLine(label: s.t('location'), value: location),
          const SizedBox(height: 8),
          Align(
            alignment: AlignmentDirectional.centerStart,
            child: Text(
              muazzin.bio,
              style: TextStyle(height: 1.5, color: colors.onSurfaceVariant),
            ),
          ),
        ],
      ),
    );
  }

  String _title(AzanEntry entry) => widget.controller.languageCode == 'ur'
      ? entry.titleUrdu
      : widget.controller.languageCode == 'ar'
      ? entry.titleArabic
      : entry.title;
  String _reciterName(Muazzin m) => widget.controller.languageCode == 'ur'
      ? m.nameUrdu
      : widget.controller.languageCode == 'ar'
      ? m.nameArabic
      : m.name;
  ImageProvider _entryImageSource(AzanEntry entry) {
    final asset = entry.muazzin.imageAsset;
    return asset == null
        ? NetworkImage(entry.muazzin.imageUrl)
        : AssetImage(asset);
  }

  double? _playerProgress(
    AzanAudioType type,
    Duration? position,
    Duration? duration,
  ) {
    if (_loadingType == type && _downloadProgress != null) {
      return _downloadProgress == 0 ? null : _downloadProgress;
    }
    if (_activeType != type ||
        duration == null ||
        duration.inMilliseconds == 0) {
      return 0;
    }
    final value =
        (position ?? Duration.zero).inMilliseconds / duration.inMilliseconds;
    return value.clamp(0, 1).toDouble();
  }

  double _sliderValue(Duration? position, Duration duration) {
    final value = (position ?? Duration.zero).inMilliseconds.toDouble();
    return value.clamp(0, duration.inMilliseconds.toDouble()).toDouble();
  }

  String _formatDuration(Duration? duration) {
    if (duration == null) return '--:--';
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);
    return '$minutes:${seconds.toString().padLeft(2, '0')}';
  }

  String _audioLabel(AzanAudioType type) => switch (type) {
    AzanAudioType.takbeer => s.t('takbeerOnly'),
    AzanAudioType.call => s.t('callOnly'),
    AzanAudioType.full => s.t('fullAzan'),
    AzanAudioType.fajr => s.t('fajrAzan'),
  };
}

class _AudioLayerIndicator extends StatelessWidget {
  const _AudioLayerIndicator({
    required this.animation,
    required this.active,
    required this.color,
  });

  final Animation<double> animation;
  final bool active;
  final Color color;

  @override
  Widget build(BuildContext context) {
    if (!active) {
      return Icon(Icons.graphic_eq, color: color, size: 26);
    }
    return AnimatedBuilder(
      animation: animation,
      builder: (context, _) {
        final value = animation.value;
        final heights = [
          8 + (10 * value),
          18 - (8 * value),
          10 + (12 * value),
          20 - (10 * value),
          9 + (9 * value),
        ];
        return SizedBox(
          width: 28,
          height: 26,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              for (final height in heights)
                Container(
                  width: 3,
                  height: height,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _DetailLine extends StatelessWidget {
  const _DetailLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 86,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: colors.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}
