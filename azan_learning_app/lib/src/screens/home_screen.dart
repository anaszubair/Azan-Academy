import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

import '../data/demo_catalog.dart';
import '../localization/app_strings.dart';
import '../models/azan.dart';
import '../state/app_controller.dart';
import 'detail_screen.dart';
import 'progress_screen.dart';
import 'settings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.controller});
  final AppController controller;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;
  String _query = '';
  bool _showCatalogueImages = false;

  AppStrings get s => AppStrings(widget.controller.languageCode);

  @override
  void initState() {
    super.initState();
    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        setState(() => _showCatalogueImages = true);
      }
    });
  }

  List<AzanEntry> get _entries => azanCatalog.where((entry) {
    final q = _query.toLowerCase().trim();
    return q.isEmpty ||
        entry.title.toLowerCase().contains(q) ||
        entry.muazzin.name.toLowerCase().contains(q);
  }).toList();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: switch (_tab) {
          0 => _catalogue(),
          1 => ProgressScreen(controller: widget.controller),
          _ => SettingsScreen(controller: widget.controller),
        },
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (value) => setState(() => _tab = value),
        destinations: [
          NavigationDestination(
            icon: const Icon(Icons.menu_book_outlined),
            selectedIcon: const Icon(Icons.menu_book),
            label: s.t('learn'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.insights_outlined),
            selectedIcon: const Icon(Icons.insights),
            label: s.t('progress'),
          ),
          NavigationDestination(
            icon: const Icon(Icons.settings_outlined),
            selectedIcon: const Icon(Icons.settings),
            label: s.t('settings'),
          ),
        ],
      ),
    );
  }

  Widget _catalogue() {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Container(
            padding: const EdgeInsets.fromLTRB(20, 28, 20, 30),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF176B4B), Color(0xFF0D4932)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: .16),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.mosque,
                        color: Colors.white,
                        size: 30,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            s.t('appName'),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 27,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                TextField(
                  onChanged: (value) => setState(() => _query = value),
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search),
                    hintText: s.t('search'),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(child: _learningSections()),
        const SliverToBoxAdapter(child: SizedBox(height: 8)),
        if (_entries.isEmpty)
          SliverFillRemaining(
            hasScrollBody: false,
            child: Center(child: Text(s.t('empty'))),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(16, 6, 16, 30),
            sliver: SliverList.builder(
              itemCount: _entries.length,
              itemBuilder: (context, index) => _entryCard(_entries[index]),
            ),
          ),
      ],
    );
  }

  Widget _entryCard(AzanEntry entry) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) =>
                DetailScreen(entry: entry, controller: widget.controller),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: _CatalogueImage(
                  image: _showCatalogueImages ? entryImageSource(entry) : null,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      localizedTitle(entry),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      localizedName(entry.muazzin),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.arrow_forward_ios_rounded, size: 18),
            ],
          ),
        ),
      ),
    );
  }

  Widget _learningSections() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 8),
      child: _InfoExpansionCard(
        title: s.t('azanGuide'),
        sections: [
          _InfoSection(title: s.t('whatIsAzan'), body: s.t('whatIsAzanBody')),
          _InfoSection(
            title: s.t('benefitsOfAzan'),
            body: s.t('benefitsOfAzanBody'),
          ),
        ],
        icon: Icons.help_outline,
        initiallyExpanded: false,
      ),
    );
  }

  ImageProvider entryImageSource(AzanEntry entry) {
    final asset = entry.muazzin.imageAsset;
    return asset == null
        ? NetworkImage(entry.muazzin.imageUrl)
        : AssetImage(asset);
  }

  String localizedName(Muazzin m) => widget.controller.languageCode == 'ur'
      ? m.nameUrdu
      : widget.controller.languageCode == 'ar'
      ? m.nameArabic
      : m.name;
  String localizedTitle(AzanEntry entry) =>
      widget.controller.languageCode == 'ur'
      ? entry.titleUrdu
      : widget.controller.languageCode == 'ar'
      ? entry.titleArabic
      : entry.title;
}

class _InfoExpansionCard extends StatelessWidget {
  const _InfoExpansionCard({
    required this.title,
    required this.sections,
    required this.icon,
    this.initiallyExpanded = false,
  });

  final String title;
  final List<_InfoSection> sections;
  final IconData icon;
  final bool initiallyExpanded;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        initiallyExpanded: initiallyExpanded,
        leading: Icon(icon, color: colors.primary),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
        childrenPadding: const EdgeInsets.fromLTRB(18, 0, 18, 18),
        children: sections
            .map(
              (section) => Padding(
                padding: const EdgeInsets.only(bottom: 14),
                child: Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        section.title,
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 6),
                      Text(section.body, style: const TextStyle(height: 1.55)),
                    ],
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _CatalogueImage extends StatelessWidget {
  const _CatalogueImage({required this.image});

  final ImageProvider? image;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    return SizedBox(
      width: 82,
      height: 82,
      child: image == null
          ? ColoredBox(
              color: colors.primaryContainer,
              child: Icon(Icons.mosque, size: 34, color: colors.primary),
            )
          : Image(
              image: ResizeImage(image!, width: 164, height: 164),
              fit: BoxFit.cover,
              filterQuality: FilterQuality.low,
              errorBuilder: (_, _, _) => ColoredBox(
                color: colors.primaryContainer,
                child: Icon(Icons.mosque, size: 34, color: colors.primary),
              ),
            ),
    );
  }
}

class _InfoSection {
  const _InfoSection({required this.title, required this.body});

  final String title;
  final String body;
}
