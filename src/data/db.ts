// ─── TYPES ───────────────────────────────────────────────────────────────────

export type PrayerType = 'Fajr' | 'Zuhr' | 'Asr' | 'Maghrib' | 'Isha'

export interface Phrase {
  id: number
  arabic: string
  transEn: string
  transUr: string
  transAr: string
  transliteration: string
}

export interface Muazzin {
  id: string
  nameEn: string
  nameUr: string
  nameAr: string
  mosqueEn: string
  mosqueUr: string
  cityEn: string
  cityUr: string
  countryEn: string
  countryUr: string
  bioEn: string
  bioUr: string
  imageUrl: string
}

export interface AzaanEntry {
  id: string
  muazzinId: string
  prayerType: PrayerType
  durationSec: number
  phrases: Phrase[]
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const img = (id: string, w = 480, h = 300) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`

// ─── PRACTICE PHRASES ────────────────────────────────────────────────────────
// Standard Azaan phrases — verified static Arabic text.
// Fajr adds phrase 5a (Prayer is better than sleep) between phrases 5 and 6.
// All religious text must be verified by a qualified scholar before production use.

const STANDARD_PHRASES: Phrase[] = [
  {
    id: 1,
    arabic:          'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ',
    transEn:         'Allah is the Greatest, Allah is the Greatest',
    transUr:         'اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے',
    transAr:         'الله أكبر، الله أكبر',
    transliteration: 'Allāhu Akbar, Allāhu Akbar',
  },
  {
    id: 2,
    arabic:          'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ',
    transEn:         'I bear witness that there is no god but Allah',
    transUr:         'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں',
    transAr:         'أشهد أن لا إله إلا الله',
    transliteration: 'Ashhadu an lā ilāha illā Allāh',
  },
  {
    id: 3,
    arabic:          'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللّٰهِ',
    transEn:         'I bear witness that Muhammad is the Messenger of Allah',
    transUr:         'میں گواہی دیتا ہوں کہ محمد ﷺ اللہ کے رسول ہیں',
    transAr:         'أشهد أن محمداً رسول الله',
    transliteration: 'Ashhadu anna Muḥammadan rasūlu Allāh',
  },
  {
    id: 4,
    arabic:          'حَيَّ عَلَى الصَّلَاةِ',
    transEn:         'Come to prayer',
    transUr:         'نماز کی طرف آؤ',
    transAr:         'حي على الصلاة',
    transliteration: 'Ḥayya ʿala ṣ-ṣalāh',
  },
  {
    id: 5,
    arabic:          'حَيَّ عَلَى الْفَلَاحِ',
    transEn:         'Come to success',
    transUr:         'فلاح کی طرف آؤ',
    transAr:         'حي على الفلاح',
    transliteration: 'Ḥayya ʿala l-falāḥ',
  },
  {
    id: 6,
    arabic:          'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ',
    transEn:         'Allah is the Greatest, Allah is the Greatest',
    transUr:         'اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے',
    transAr:         'الله أكبر، الله أكبر',
    transliteration: 'Allāhu Akbar, Allāhu Akbar',
  },
  {
    id: 7,
    arabic:          'لَا إِلٰهَ إِلَّا اللّٰهُ',
    transEn:         'There is no god but Allah',
    transUr:         'اللہ کے سوا کوئی معبود نہیں',
    transAr:         'لا إله إلا الله',
    transliteration: 'Lā ilāha illā Allāh',
  },
]

const FAJR_PHRASES: Phrase[] = [
  ...STANDARD_PHRASES.slice(0, 5),
  {
    id: 55,
    arabic:          'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ',
    transEn:         'Prayer is better than sleep',
    transUr:         'نماز نیند سے بہتر ہے',
    transAr:         'الصلاة خير من النوم',
    transliteration: 'Aṣ-ṣalātu khayrun mina n-nawm',
  },
  ...STANDARD_PHRASES.slice(5),
]

// ─── MUAZZIN REPOSITORY ───────────────────────────────────────────────────────
// Demo data only — names are illustrative. Replace with verified profiles.

export const MUAZZINS: Muazzin[] = [
  {
    id: 'm1',
    nameEn:    'Sheikh Abdullah Al-Hudhaifi Style',
    nameUr:    'شیخ عبداللہ الحذیفی اسٹائل',
    nameAr:    'بأسلوب الشيخ عبدالله الحذيفي',
    mosqueEn:  'Masjid al-Nabawi',
    mosqueUr:  'مسجد نبوی',
    cityEn:    'Madinah',
    cityUr:    'مدینہ منورہ',
    countryEn: 'Saudi Arabia',
    countryUr: 'سعودی عرب',
    bioEn:     'This practice session follows the traditional style of Masjid al-Nabawi — measured, melodious, and deeply reverential. The Madinah style is known for its calm clarity and devotion. (Demo data — replace with verified Muazzin profiles.)',
    bioUr:     'یہ پریکٹس سیشن مسجد نبوی کے روایتی انداز پر مبنی ہے — معتدل، سریلا اور انتہائی عقیدت مند۔ (ڈیمو ڈیٹا — تصدیق شدہ مؤذن پروفائلز سے تبدیل کریں۔)',
    imageUrl:  img('photo-1605976528013-638e49b6599f'),
  },
  {
    id: 'm2',
    nameEn:    'Makkah Grand Mosque Style',
    nameUr:    'مسجد الحرام اسٹائل',
    nameAr:    'بأسلوب المسجد الحرام',
    mosqueEn:  'Masjid al-Haram',
    mosqueUr:  'مسجد الحرام',
    cityEn:    'Makkah',
    cityUr:    'مکہ مکرمہ',
    countryEn: 'Saudi Arabia',
    countryUr: 'سعودی عرب',
    bioEn:     'The Masjid al-Haram style carries the timeless sound heard by millions of pilgrims each year. Its powerful projection and precise articulation make it an ideal model for practice. (Demo data — replace with verified Muazzin profiles.)',
    bioUr:     'مسجد الحرام کا انداز وہ لازوال آواز ہے جو ہر سال لاکھوں حجاج سنتے ہیں۔ (ڈیمو ڈیٹا — تصدیق شدہ مؤذن پروفائلز سے تبدیل کریں۔)',
    imageUrl:  img('photo-1553755088-ef1973c7b4a1'),
  },
  {
    id: 'm3',
    nameEn:    'Turkish Classical Style',
    nameUr:    'ترکی کلاسیکل اسٹائل',
    nameAr:    'بالأسلوب التركي الكلاسيكي',
    mosqueEn:  'Sultan Ahmed Mosque',
    mosqueUr:  'سلطان احمد مسجد (نیلی مسجد)',
    cityEn:    'Istanbul',
    cityUr:    'استنبول',
    countryEn: 'Turkey',
    countryUr: 'ترکیہ',
    bioEn:     'The Ottoman Turkish tradition developed a unique melodic elaboration of the Azaan, with rich maqam-based ornamentation. This classical style echoes across Istanbul from six minarets. (Demo data — replace with verified Muazzin profiles.)',
    bioUr:     'عثمانی ترکی روایت نے اذان کی ایک منفرد سریلی ترقی کی جسے چھ میناروں سے استنبول میں گونجتے سنا جا سکتا ہے۔ (ڈیمو ڈیٹا)',
    imageUrl:  img('photo-1466442929976-97f336a657be'),
  },
  {
    id: 'm4',
    nameEn:    'Pakistani Traditional Style',
    nameUr:    'پاکستانی روایتی اسٹائل',
    nameAr:    'بالأسلوب الباكستاني التقليدي',
    mosqueEn:  'Badshahi Mosque',
    mosqueUr:  'بادشاہی مسجد',
    cityEn:    'Lahore',
    cityUr:    'لاہور',
    countryEn: 'Pakistan',
    countryUr: 'پاکستان',
    bioEn:     'The South Asian tradition blends classical Arabic articulation with the Hindustani musical tradition, creating a deeply emotional and devotional rendition. The Badshahi Mosque in Lahore is one of South Asia\'s most iconic prayer spaces. (Demo data.)',
    bioUr:     'جنوبی ایشیائی روایت کلاسیکی عربی تلفظ کو ہندوستانی موسیقی کی روایت سے ملا کر ایک جذباتی اور عقیدت مند انداز تخلیق کرتی ہے۔ (ڈیمو ڈیٹا)',
    imageUrl:  img('photo-1603491656337-3b491147917c'),
  },
  {
    id: 'm5',
    nameEn:    'Egyptian Classical Style',
    nameUr:    'مصری کلاسیکل اسٹائل',
    nameAr:    'بالأسلوب المصري الكلاسيكي',
    mosqueEn:  'Al-Azhar Mosque',
    mosqueUr:  'الجامع الأزہر',
    cityEn:    'Cairo',
    cityUr:    'قاہرہ',
    countryEn: 'Egypt',
    countryUr: 'مصر',
    bioEn:     'The Egyptian maqam tradition produces one of the most melodically sophisticated styles of Azaan in the world. Al-Azhar, over a thousand years old, has trained generations of reciters and callers to prayer. (Demo data.)',
    bioUr:     'مصری مقام روایت دنیا کے سب سے زیادہ موسیقی کے لحاظ سے نفیس اذان کے انداز میں سے ایک پیدا کرتی ہے۔ (ڈیمو ڈیٹا)',
    imageUrl:  img('photo-1595979904086-471704dc0e81'),
  },
]

// ─── AZAAN ENTRY REPOSITORY ───────────────────────────────────────────────────

export const AZAAN_ENTRIES: AzaanEntry[] = [
  { id: 'a1', muazzinId: 'm1', prayerType: 'Fajr',    durationSec: 225, phrases: FAJR_PHRASES    },
  { id: 'a2', muazzinId: 'm1', prayerType: 'Isha',    durationSec: 210, phrases: STANDARD_PHRASES },
  { id: 'a3', muazzinId: 'm2', prayerType: 'Fajr',    durationSec: 240, phrases: FAJR_PHRASES    },
  { id: 'a4', muazzinId: 'm2', prayerType: 'Zuhr',    durationSec: 252, phrases: STANDARD_PHRASES },
  { id: 'a5', muazzinId: 'm3', prayerType: 'Asr',     durationSec: 198, phrases: STANDARD_PHRASES },
  { id: 'a6', muazzinId: 'm3', prayerType: 'Maghrib', durationSec: 174, phrases: STANDARD_PHRASES },
  { id: 'a7', muazzinId: 'm4', prayerType: 'Fajr',    durationSec: 215, phrases: FAJR_PHRASES    },
  { id: 'a8', muazzinId: 'm5', prayerType: 'Isha',    durationSec: 235, phrases: STANDARD_PHRASES },
]

export function getMuazzin(id: string): Muazzin | undefined {
  return MUAZZINS.find((m) => m.id === id)
}

export function getEntriesForPrayer(prayer: PrayerType | 'ALL'): AzaanEntry[] {
  if (prayer === 'ALL') return AZAAN_ENTRIES
  return AZAAN_ENTRIES.filter((e) => e.prayerType === prayer)
}
