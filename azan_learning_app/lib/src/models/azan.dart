enum PrayerType { fajr, dhuhr, asr, maghrib, isha }

enum AzanAudioType { takbeer, call, full, fajr }

class AzanPhrase {
  const AzanPhrase({
    required this.arabic,
    required this.transliteration,
    required this.english,
    required this.urdu,
    this.referenceAudioUrl,
  });
  final String arabic;
  final String transliteration;
  final String english;
  final String urdu;
  final String? referenceAudioUrl;
}

class Muazzin {
  const Muazzin({
    required this.id,
    required this.name,
    required this.nameUrdu,
    required this.nameArabic,
    required this.mosque,
    required this.mosqueUrdu,
    required this.city,
    required this.country,
    required this.bio,
    required this.imageUrl,
    this.imageAsset,
    required this.imageCaption,
    required this.placeDescription,
  });
  final String id;
  final String name;
  final String nameUrdu;
  final String nameArabic;
  final String mosque;
  final String mosqueUrdu;
  final String city;
  final String country;
  final String bio;
  final String imageUrl;
  final String? imageAsset;
  final String imageCaption;
  final String placeDescription;
}

class AzanEntry {
  const AzanEntry({
    required this.id,
    required this.title,
    required this.titleUrdu,
    required this.titleArabic,
    required this.muazzin,
    required this.phrases,
    required this.downloadUrl,
    required this.archivePrefix,
    required this.availableAudio,
  });
  final String id;
  final String title;
  final String titleUrdu;
  final String titleArabic;
  final Muazzin muazzin;
  final List<AzanPhrase> phrases;
  final String downloadUrl;
  final String archivePrefix;
  final Set<AzanAudioType> availableAudio;
}
