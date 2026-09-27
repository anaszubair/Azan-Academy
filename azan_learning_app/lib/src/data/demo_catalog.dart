import '../models/azan.dart';

const standardPhrases = <AzanPhrase>[
  AzanPhrase(
    arabic: 'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar, Allahu Akbar',
    english: 'Allah is the Greatest, Allah is the Greatest',
    urdu: 'اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے',
  ),
  AzanPhrase(
    arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ',
    transliteration: 'Ashhadu an la ilaha illallah',
    english: 'I bear witness that there is no god but Allah',
    urdu: 'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں',
  ),
  AzanPhrase(
    arabic: 'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللّٰهِ',
    transliteration: 'Ashhadu anna Muhammadan rasulullah',
    english: 'I bear witness that Muhammad is the Messenger of Allah',
    urdu: 'میں گواہی دیتا ہوں کہ محمد ﷺ اللہ کے رسول ہیں',
  ),
  AzanPhrase(
    arabic: 'حَيَّ عَلَى الصَّلَاةِ',
    transliteration: 'Hayya alas-salah',
    english: 'Come to prayer',
    urdu: 'نماز کی طرف آؤ',
  ),
  AzanPhrase(
    arabic: 'حَيَّ عَلَى الْفَلَاحِ',
    transliteration: 'Hayya alal-falah',
    english: 'Come to success',
    urdu: 'فلاح کی طرف آؤ',
  ),
  AzanPhrase(
    arabic: 'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar, Allahu Akbar',
    english: 'Allah is the Greatest, Allah is the Greatest',
    urdu: 'اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے',
  ),
  AzanPhrase(
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',
    transliteration: 'La ilaha illallah',
    english: 'There is no god but Allah',
    urdu: 'اللہ کے سوا کوئی معبود نہیں',
  ),
];

const _allFour = <AzanAudioType>{
  AzanAudioType.takbeer,
  AzanAudioType.call,
  AzanAudioType.full,
  AzanAudioType.fajr,
};
const _withoutFajr = <AzanAudioType>{
  AzanAudioType.takbeer,
  AzanAudioType.call,
  AzanAudioType.full,
};

const azanCatalog = <AzanEntry>[
  AzanEntry(
    id: 'mishari-irama-kurdi',
    title: 'Mishari Irama Kurdi',
    titleUrdu: 'مشاری عراقی کردی',
    titleArabic: 'مشاري إيراما كردي',
    muazzin: Muazzin(
      id: 'sheikh-mishari-irama-kurdi',
      name: 'Sheikh Mishari Irama Kurdi',
      nameUrdu: 'شیخ مشاری عراقی کردی',
      nameArabic: 'الشيخ مشاري إيراما كردي',
      mosque: 'Masjid al-Haram',
      mosqueUrdu: 'مسجد الحرام',
      city: 'Makkah',
      country: 'Saudi Arabia',
      bio:
          'A Makkah-inspired Azan style for practicing clear Takbeer, measured pauses, and a confident full call.',
      imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Great_Mosque_of_Mecca1.jpg?width=1200',
      imageAsset: 'assets/images/makkah.avif',
      imageCaption: 'Masjid al-Haram, Makkah, Saudi Arabia',
      placeDescription:
          'The Makkah placeholder shows Masjid al-Haram, the sacred mosque surrounding the Kaaba in Saudi Arabia.',
    ),
    phrases: standardPhrases,
    downloadUrl:
        'https://q1.pakdata.com/Adhan/Android/MishariIramaKurdi/data.zip',
    archivePrefix: 'MishariIramaKurdi',
    availableAudio: _allFour,
  ),
  AzanEntry(
    id: 'makkah',
    title: 'Makkah',
    titleUrdu: 'مکہ مکرمہ',
    titleArabic: 'مكة المكرمة',
    muazzin: Muazzin(
      id: 'sheikh-sudais',
      name: 'Sheikh Sudais',
      nameUrdu: 'شیخ سدیس',
      nameArabic: 'الشيخ السديس',
      mosque: 'Masjid al-Haram',
      mosqueUrdu: 'مسجد الحرام',
      city: 'Makkah',
      country: 'Saudi Arabia',
      bio:
          'A Makkah collection for learners who want to study the rhythm and strength of a Haramain-style Azan.',
      imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/The_Kabah_in_the_Grand_Mosque_of_Makkah%2C_Saudi_Arabia_(52501405646).jpg?width=1200',
      imageAsset: 'assets/images/makkah.avif',
      imageCaption: 'Masjid al-Haram, Makkah, Saudi Arabia',
      placeDescription:
          'This card uses a Makkah mosque placeholder so the learner can quickly identify the Saudi Arabia collection.',
    ),
    phrases: standardPhrases,
    downloadUrl: 'https://q1.pakdata.com/Adhan/Android/Makkah/data.zip',
    archivePrefix: 'Makkah',
    availableAudio: _allFour,
  ),
  AzanEntry(
    id: 'mishari-alafasy',
    title: 'Mishari Alafasy',
    titleUrdu: 'مشاری العفاسی',
    titleArabic: 'مشاري العفاسي',
    muazzin: Muazzin(
      id: 'sheikh-mishari-alafasy',
      name: 'Sheikh Mishari Alafasy',
      nameUrdu: 'شیخ مشاری العفاسی',
      nameArabic: 'الشيخ مشاري العفاسي',
      mosque: 'Masjid al-Haram',
      mosqueUrdu: 'مسجد الحرام',
      city: 'Makkah',
      country: 'Saudi Arabia',
      bio:
          'A melodic sample style for practicing smooth transitions between each phrase of the Azan.',
      imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Maqam_Ibrahim%2C_Makkah.jpg?width=1200',
      imageAsset: 'assets/images/makkah.avif',
      imageCaption: 'Maqam Ibrahim area, Masjid al-Haram, Makkah',
      placeDescription:
          'The image keeps this collection visually connected to Makkah while giving it a different identity in the list.',
    ),
    phrases: standardPhrases,
    downloadUrl: 'https://q1.pakdata.com/Adhan/Android/MishariAlafasy/data.zip',
    archivePrefix: 'MishariAlafasy',
    availableAudio: _allFour,
  ),
  AzanEntry(
    id: 'nabwi',
    title: 'Madinah',
    titleUrdu: 'مدینہ منورہ',
    titleArabic: 'المدينة المنورة',
    muazzin: Muazzin(
      id: 'sheikh-shuraim',
      name: 'Sheikh Shuraim',
      nameUrdu: 'شیخ شریم',
      nameArabic: 'الشيخ الشريم',
      mosque: 'Al-Masjid an-Nabawi',
      mosqueUrdu: 'مسجد نبوی',
      city: 'Madinah',
      country: 'Saudi Arabia',
      bio:
          'A Madinah-inspired practice pack focused on calm delivery, clarity, and respectful pacing.',
      imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Al-Masjid_an-Nabawi.jpg?width=1200',
      imageAsset: 'assets/images/madina.avif',
      imageCaption: 'Al-Masjid an-Nabawi, Madinah, Saudi Arabia',
      placeDescription:
          'The Madinah placeholder shows Al-Masjid an-Nabawi so this pack is easy to distinguish from Makkah styles.',
    ),
    phrases: standardPhrases,
    downloadUrl: 'https://q1.pakdata.com/Adhan/Android/nabwi/data.zip',
    archivePrefix: 'nabwi',
    availableAudio: _allFour,
  ),
  AzanEntry(
    id: 'indonesian',
    title: 'Indonesian',
    titleUrdu: 'انڈونیشین',
    titleArabic: 'الإندونيسي',
    muazzin: Muazzin(
      id: 'sheikh-saad',
      name: 'Sheikh Saad',
      nameUrdu: 'شیخ سعد',
      nameArabic: 'الشيخ سعد',
      mosque: 'Istiqlal Mosque',
      mosqueUrdu: 'مسجد استقلال',
      city: 'Jakarta',
      country: 'Indonesia',
      bio:
          'An Indonesian-style collection for learners who want a softer regional tone and steady pronunciation practice.',
      imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Grand_Istiqlal_Mosque.jpg?width=1200',
      imageCaption: 'Istiqlal Mosque, Jakarta, Indonesia',
      placeDescription:
          'The Indonesia placeholder uses Istiqlal Mosque in Jakarta, one of the country\'s most recognised mosques.',
    ),
    phrases: standardPhrases,
    downloadUrl: 'https://q1.pakdata.com/Adhan/Android/Indonesian/data.zip',
    archivePrefix: 'Indonesian',
    availableAudio: _allFour,
  ),
  AzanEntry(
    id: 'istanbul',
    title: 'Istanbul',
    titleUrdu: 'استنبول',
    titleArabic: 'إسطنبول',
    muazzin: Muazzin(
      id: 'sheikh-maher',
      name: 'Sheikh Maher',
      nameUrdu: 'شیخ ماہر',
      nameArabic: 'الشيخ ماهر',
      mosque: 'Sultan Ahmed Mosque',
      mosqueUrdu: 'سلطان احمد مسجد',
      city: 'Istanbul',
      country: 'Turkiye',
      bio:
          'An Istanbul collection with a Turkish mosque placeholder and a practice flow for the available audio parts.',
      imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Blue_Mosque_at_Dusk.jpg?width=1200',
      imageAsset: 'assets/images/istanbul.jpg',
      imageCaption: 'Sultan Ahmed Mosque, Istanbul, Turkiye',
      placeDescription:
          'The Istanbul placeholder shows the Sultan Ahmed Mosque, commonly known as the Blue Mosque.',
    ),
    phrases: standardPhrases,
    downloadUrl: 'https://q1.pakdata.com/Adhan/Android/Istanbul/data.zip',
    archivePrefix: 'Istanbul',
    availableAudio: _withoutFajr,
  ),
  AzanEntry(
    id: 'alaqsa',
    title: 'Al-Aqsa',
    titleUrdu: 'مسجد اقصیٰ',
    titleArabic: 'المسجد الأقصى',
    muazzin: Muazzin(
      id: 'sheikh-yousef-abu-sneineh',
      name: 'Sheikh Yousef Abu Sneineh',
      nameUrdu: 'شیخ یوسف ابو سنینہ',
      nameArabic: 'الشيخ يوسف أبو سنينة',
      mosque: 'Al-Aqsa Mosque',
      mosqueUrdu: 'مسجد اقصیٰ',
      city: 'Jerusalem',
      country: 'Palestine',
      bio:
          'An Al-Aqsa collection for practicing the available Takbeer, call, and full Azan audio.',
      imageUrl:
          'https://commons.wikimedia.org/wiki/Special:FilePath/Al_aqsa_moschee_2.jpg?width=1200',
      imageAsset: 'assets/images/alaqsa.jpg',
      imageCaption: 'Al-Aqsa Mosque, Jerusalem',
      placeDescription:
          'The Al-Aqsa placeholder helps learners identify this Jerusalem collection at a glance.',
    ),
    phrases: standardPhrases,
    downloadUrl: 'https://q1.pakdata.com/Adhan/Android/Alaqsa/data.zip',
    archivePrefix: 'Alaqsa',
    availableAudio: _withoutFajr,
  ),
];
