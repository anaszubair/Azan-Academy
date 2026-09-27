import 'package:flutter/material.dart';

import 'localization/app_strings.dart';
import 'screens/home_screen.dart';
import 'state/app_controller.dart';

const _green = Color(0xFF176B4B);
const _cream = Color(0xFFFAF7F0);

class AzanLearningApp extends StatelessWidget {
  const AzanLearningApp({super.key, required this.controller});
  final AppController controller;

  ThemeData _theme(Brightness brightness) {
    final dark = brightness == Brightness.dark;
    final scheme = ColorScheme.fromSeed(
      seedColor: _green,
      brightness: brightness,
      surface: dark ? const Color(0xFF131C29) : Colors.white,
    );
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor: dark ? const Color(0xFF0D1117) : _cream,
      fontFamily: 'sans-serif',
      cardTheme: CardThemeData(
        elevation: 0,
        color: scheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: scheme.outlineVariant),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: dark ? const Color(0xFF1A2535) : Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        final strings = AppStrings(controller.languageCode);
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Azan Academy',
          theme: _theme(Brightness.light),
          darkTheme: _theme(Brightness.dark),
          themeMode: controller.themeMode,
          locale: Locale(controller.languageCode),
          supportedLocales: AppStrings.supportedLocales,
          builder: (context, child) => Directionality(
            textDirection: strings.isRtl
                ? TextDirection.rtl
                : TextDirection.ltr,
            child: child!,
          ),
          home: HomeScreen(controller: controller),
        );
      },
    );
  }
}
