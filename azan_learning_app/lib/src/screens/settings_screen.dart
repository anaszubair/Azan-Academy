import 'package:flutter/material.dart';

import '../localization/app_strings.dart';
import '../state/app_controller.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key, required this.controller});
  final AppController controller;

  @override
  Widget build(BuildContext context) {
    final s = AppStrings(controller.languageCode);
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        const SizedBox(height: 12),
        Text(
          s.t('settings'),
          style: Theme.of(
            context,
          ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 24),
        _Section(
          title: s.t('language'),
          child: Column(
            children: [
              _languageTile('English', 'en'),
              const Divider(height: 1),
              _languageTile('اردو', 'ur'),
              const Divider(height: 1),
              _languageTile('العربية', 'ar'),
            ],
          ),
        ),
        const SizedBox(height: 20),
        _Section(
          title: s.t('appearance'),
          child: Column(
            children: [
              _themeTile(
                context,
                s.t('system'),
                ThemeMode.system,
                Icons.brightness_auto,
              ),
              const Divider(height: 1),
              _themeTile(
                context,
                s.t('light'),
                ThemeMode.light,
                Icons.light_mode_outlined,
              ),
              const Divider(height: 1),
              _themeTile(
                context,
                s.t('dark'),
                ThemeMode.dark,
                Icons.dark_mode_outlined,
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.verified_user_outlined,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Content policy',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  'Azan text, translations, Muazzin profiles, and recordings must be verified and properly licensed before public release.',
                  style: TextStyle(
                    height: 1.5,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 30),
        Center(
          child: Text(
            'Azan Academy • 1.0.0',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ),
      ],
    );
  }

  Widget _languageTile(String label, String code) => ListTile(
    onTap: () => controller.setLanguage(code),
    title: Text(label),
    trailing: controller.languageCode == code
        ? const Icon(Icons.check_circle)
        : const Icon(Icons.circle_outlined),
  );
  Widget _themeTile(
    BuildContext context,
    String label,
    ThemeMode mode,
    IconData icon,
  ) => ListTile(
    onTap: () => controller.setTheme(mode),
    leading: Icon(icon),
    title: Text(label),
    trailing: controller.themeMode == mode
        ? const Icon(Icons.check_circle)
        : const Icon(Icons.circle_outlined),
  );
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Padding(
        padding: const EdgeInsetsDirectional.only(start: 4, bottom: 8),
        child: Text(
          title.toUpperCase(),
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 1,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ),
      Card(clipBehavior: Clip.antiAlias, child: child),
    ],
  );
}
