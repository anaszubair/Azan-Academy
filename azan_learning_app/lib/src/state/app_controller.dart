import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PracticeRecording {
  const PracticeRecording({
    required this.path,
    required this.azanId,
    required this.azanName,
    required this.phrase,
    required this.createdAt,
  });

  final String path;
  final String azanId;
  final String azanName;
  final String phrase;
  final DateTime createdAt;

  Map<String, Object?> toJson() => {
    'path': path,
    'azanId': azanId,
    'azanName': azanName,
    'phrase': phrase,
    'createdAt': createdAt.toIso8601String(),
  };

  static PracticeRecording? fromJson(String value) {
    try {
      final json = jsonDecode(value) as Map<String, dynamic>;
      return PracticeRecording(
        path: json['path'] as String,
        azanId: json['azanId'] as String,
        azanName: json['azanName'] as String,
        phrase: json['phrase'] as String,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
    } catch (_) {
      return null;
    }
  }
}

class AppController extends ChangeNotifier {
  SharedPreferences? _prefs;
  Future<SharedPreferences>? _prefsFuture;
  String languageCode = 'en';
  ThemeMode themeMode = ThemeMode.system;
  Set<String> favorites = <String>{};
  int practiceAttempts = 0;
  int completedSessions = 0;
  List<PracticeRecording> recordings = <PracticeRecording>[];
  Map<String, int> phrasePracticeCounts = <String, int>{};

  Future<void> load() async {
    final prefs = await _preferences();
    languageCode = prefs.getString('language') ?? 'en';
    themeMode = ThemeMode.values.firstWhere(
      (mode) => mode.name == prefs.getString('theme'),
      orElse: () => ThemeMode.system,
    );
    favorites = (prefs.getStringList('favorites') ?? const <String>[]).toSet();
    practiceAttempts = prefs.getInt('practiceAttempts') ?? 0;
    completedSessions = prefs.getInt('completedSessions') ?? 0;
    phrasePracticeCounts = _decodePhraseCounts(
      prefs.getString('phrasePracticeCounts'),
    );
    recordings =
        (prefs.getStringList('recordings') ?? const <String>[])
            .map(PracticeRecording.fromJson)
            .whereType<PracticeRecording>()
            .toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    notifyListeners();
  }

  Future<SharedPreferences> _preferences() {
    final prefs = _prefs;
    if (prefs != null) return Future.value(prefs);
    return _prefsFuture ??= SharedPreferences.getInstance().then((value) {
      _prefs = value;
      return value;
    });
  }

  Future<void> setLanguage(String value) async {
    languageCode = value;
    final prefs = await _preferences();
    await prefs.setString('language', value);
    notifyListeners();
  }

  Future<void> setTheme(ThemeMode value) async {
    themeMode = value;
    final prefs = await _preferences();
    await prefs.setString('theme', value.name);
    notifyListeners();
  }

  Future<void> toggleFavorite(String id) async {
    favorites.contains(id) ? favorites.remove(id) : favorites.add(id);
    final prefs = await _preferences();
    await prefs.setStringList('favorites', favorites.toList());
    notifyListeners();
  }

  Future<void> recordAttempt({
    String? path,
    String? azanId,
    String? azanName,
    String? phrase,
    int? phraseIndex,
  }) async {
    practiceAttempts++;
    final prefs = await _preferences();
    await prefs.setInt('practiceAttempts', practiceAttempts);
    if (azanId != null && phraseIndex != null) {
      final key = phrasePracticeKey(azanId, phraseIndex);
      phrasePracticeCounts[key] = ((phrasePracticeCounts[key] ?? 0) + 1) % 10;
      await prefs.setString(
        'phrasePracticeCounts',
        jsonEncode(phrasePracticeCounts),
      );
    }
    if (path != null && azanId != null && azanName != null && phrase != null) {
      recordings.insert(
        0,
        PracticeRecording(
          path: path,
          azanId: azanId,
          azanName: azanName,
          phrase: phrase,
          createdAt: DateTime.now(),
        ),
      );
      await prefs.setStringList(
        'recordings',
        recordings.map((recording) => jsonEncode(recording.toJson())).toList(),
      );
    }
    notifyListeners();
  }

  Future<void> completeSession() async {
    completedSessions++;
    final prefs = await _preferences();
    await prefs.setInt('completedSessions', completedSessions);
    notifyListeners();
  }

  int phrasePracticeCount(String azanId, int phraseIndex) =>
      phrasePracticeCounts[phrasePracticeKey(azanId, phraseIndex)] ?? 0;

  String phrasePracticeKey(String azanId, int phraseIndex) =>
      '$azanId:$phraseIndex';

  Map<String, int> _decodePhraseCounts(String? value) {
    if (value == null) return <String, int>{};
    try {
      final decoded = jsonDecode(value) as Map<String, dynamic>;
      return decoded.map(
        (key, value) => MapEntry(key, value is int ? value : 0),
      );
    } catch (_) {
      return <String, int>{};
    }
  }
}
