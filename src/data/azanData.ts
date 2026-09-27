// ─── TYPES ───────────────────────────────────────────────────────────────────

export type Lang = 'en' | 'ur'
export type PrayerType = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export interface AzanPhrase {
  id: number
  arabic: string
  transEn: string
  transUr: string
}

export interface AzanEntry {
  id: string
  muazzinEn: string
  muazzinUr: string
  titleEn: string
  titleUr: string
  duration: string
  prayerType: PrayerType
  isFavorite: boolean
  phrases: AzanPhrase[]
}

// ─── SHARED PHRASES (Demo — verified static text) ─────────────────────────────

const SHARED_PHRASES: AzanPhrase[] = [
  { id: 1, arabic: 'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ',                    transEn: 'Allah is the Greatest, Allah is the Greatest',              transUr: 'اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے' },
  { id: 2, arabic: 'أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ',              transEn: 'I bear witness there is no god but Allah',                   transUr: 'میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں' },
  { id: 3, arabic: 'أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللّٰهِ',            transEn: 'I bear witness that Muhammad is the Messenger of Allah',     transUr: 'میں گواہی دیتا ہوں کہ محمد ﷺ اللہ کے رسول ہیں' },
  { id: 4, arabic: 'حَيَّ عَلَى الصَّلَاةِ',                               transEn: 'Come to prayer',                                            transUr: 'نماز کی طرف آؤ' },
  { id: 5, arabic: 'حَيَّ عَلَى الْفَلَاحِ',                               transEn: 'Come to success',                                           transUr: 'فلاح کی طرف آؤ' },
  { id: 6, arabic: 'اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ',                    transEn: 'Allah is the Greatest, Allah is the Greatest',              transUr: 'اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے' },
  { id: 7, arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ',                            transEn: 'There is no god but Allah',                                 transUr: 'اللہ کے سوا کوئی معبود نہیں' },
]

// ─── DEMO AZAN REPOSITORY ────────────────────────────────────────────────────
// Replace with QMAzanRepository to connect Quran Majeed's real Azan library.

export const DEMO_AZANS: AzanEntry[] = [
  {
    id: '1',
    muazzinEn: 'Sheikh Abdullah Al-Hudhaifi',
    muazzinUr: 'شیخ عبداللہ الحذیفی',
    titleEn: 'Masjid al-Nabawi',
    titleUr: 'مسجد نبوی',
    duration: '3:45',
    prayerType: 'Fajr',
    isFavorite: false,
    phrases: SHARED_PHRASES,
  },
  {
    id: '2',
    muazzinEn: 'Sheikh Ali Ahmed Mulla',
    muazzinUr: 'شیخ علی احمد ملا',
    titleEn: 'Masjid al-Haram',
    titleUr: 'مسجد الحرام',
    duration: '4:12',
    prayerType: 'Dhuhr',
    isFavorite: true,
    phrases: SHARED_PHRASES,
  },
  {
    id: '3',
    muazzinEn: 'Sheikh Mishary Rashid Al-Afasy',
    muazzinUr: 'شیخ مشاری راشد العفاسی',
    titleEn: 'Traditional Azan',
    titleUr: 'روایتی اذان',
    duration: '3:20',
    prayerType: 'Maghrib',
    isFavorite: false,
    phrases: SHARED_PHRASES,
  },
  {
    id: '4',
    muazzinEn: 'Sheikh Saad Al-Ghamdi',
    muazzinUr: 'شیخ سعد الغامدی',
    titleEn: 'Masjid al-Qiblatayn',
    titleUr: 'مسجد القبلتین',
    duration: '3:55',
    prayerType: 'Isha',
    isFavorite: false,
    phrases: SHARED_PHRASES,
  },
  {
    id: '5',
    muazzinEn: 'Sheikh Abdul-Rahman Al-Sudais',
    muazzinUr: 'شیخ عبدالرحمن السدیس',
    titleEn: 'Grand Mosque Azan',
    titleUr: 'مسجد الحرام کی اذان',
    duration: '4:30',
    prayerType: 'Asr',
    isFavorite: false,
    phrases: SHARED_PHRASES,
  },
]

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

export const UI_TEXT = {
  practiceAzan:     { en: 'Practice Azan',                  ur: 'اذان کی پریکٹس' },
  selectAzan:       { en: 'Select Azan',                    ur: 'اذان منتخب کریں' },
  listen:           { en: 'Listen',                         ur: 'سنیں' },
  replay:           { en: 'Replay',                         ur: 'دوبارہ سنیں' },
  practice:         { en: 'Practice',                       ur: 'پریکٹس کریں' },
  startRec:         { en: 'Start Recording',                ur: 'ریکارڈنگ شروع کریں' },
  tapToRecord:      { en: 'Tap to Record',                  ur: 'ریکارڈ کرنے کے لیے دبائیں' },
  recording:        { en: '🔴 Recording...',                ur: '🔴 ریکارڈنگ جاری ہے...' },
  stop:             { en: 'Stop',                           ur: 'روکیں' },
  myRecording:      { en: 'My Recording',                   ur: 'میری ریکارڈنگ' },
  practiceAgain:    { en: 'Practice Again',                 ur: 'دوبارہ پریکٹس کریں' },
  nextPhrase:       { en: 'Next Phrase',                    ur: 'اگلا جملہ' },
  completeAzan:     { en: 'Complete Azan Practice',         ur: 'مکمل اذان کی پریکٹس' },
  myProgress:       { en: 'My Progress',                    ur: 'میری کارکردگی' },
  todaysPractice:   { en: "Today's Practice",               ur: 'آج کی پریکٹس' },
  phraseByPhrase:   { en: 'Phrase by Phrase',               ur: 'ایک ایک جملے کی پریکٹس' },
  startPractice:    { en: 'Start Practice',                 ur: 'پریکٹس شروع کریں' },
  referenceAzan:    { en: 'Reference Azan',                 ur: 'اصل اذان' },
  yourPractice:     { en: 'Your Practice',                  ur: 'آپ کی پریکٹس' },
  listenCompare:    { en: 'Listen & Compare',               ur: 'سنیں اور موازنہ کریں' },
  playRef:          { en: '▶ Reference',                    ur: '▶ اصل اذان' },
  playMine:         { en: '▶ My Recording',                 ur: '▶ میری ریکارڈنگ' },
  practiceComplete: { en: 'Practice Complete 🎉',            ur: 'پریکٹس مکمل ہوگئی 🎉' },
  mashAllah:        { en: 'MashAllah! Practice completed.', ur: 'ماشاءاللہ! پریکٹس مکمل ہوئی۔' },
  phrasesCompleted: { en: 'Phrases Completed',              ur: 'مکمل کیے گئے جملے' },
  sessions:         { en: 'Practice Sessions',              ur: 'پریکٹس سیشنز' },
  totalTime:        { en: 'Total Practice Time',            ur: 'کل پریکٹس کا وقت' },
  streak:           { en: 'Current Streak',                 ur: 'مسلسل پریکٹس' },
  muazzinJourney:   { en: 'Muazzin Journey',               ur: 'مؤذن بننے کا سفر' },
  feedback:         { en: 'Practice Feedback',              ur: 'پریکٹس کی رائے' },
  feedbackNote:     { en: 'Practice feedback is for learning assistance only.', ur: 'پریکٹس کی رائے صرف سیکھنے میں مدد کے لیے ہے۔' },
  favAzans:         { en: 'Favorite Azans',                 ur: 'پسندیدہ اذانیں' },
  search:           { en: 'Search Azan or Muazzin',         ur: 'اذان یا مؤذن تلاش کریں' },
  all:              { en: 'All',                            ur: 'تمام' },
  language:         { en: 'Language',                       ur: 'زبان' },
  settings:         { en: 'Settings',                       ur: 'ترتیبات' },
  muazzin:          { en: 'Muazzin',                        ur: 'مؤذن' },
  selected:         { en: 'Selected Azan',                  ur: 'منتخب کردہ اذان' },
  fullAzanListen:   { en: '▶ Listen to Full Azan',          ur: '▶ مکمل اذان سنیں' },
  choosePractice:   { en: 'Choose Practice Mode',           ur: 'پریکٹس کا طریقہ منتخب کریں' },
  saveProgress:     { en: 'Save Progress',                  ur: 'پروگریس محفوظ کریں' },
  minutes:          { en: 'min',                            ur: 'منٹ' },
  days:             { en: 'days',                           ur: 'دن' },
  micPermission:    { en: 'Microphone permission is required to record your practice.', ur: 'آپ کی پریکٹس ریکارڈ کرنے کے لیے مائیکروفون کی اجازت ضروری ہے۔' },
  allow:            { en: 'Allow Microphone', ur: 'اجازت دیں' },
  reRecord:         { en: 'Record Again',     ur: 'دوبارہ ریکارڈ کریں' },
  noAzans:          { en: 'No Azans Available', ur: 'کوئی اذان دستیاب نہیں' },
  retry:            { en: 'Retry', ur: 'دوبارہ کوشش کریں' },
}

export function tx(lang: Lang, key: keyof typeof UI_TEXT): string {
  return UI_TEXT[key][lang]
}

export const PRAYER_LABELS: Record<PrayerType, { en: string; ur: string }> = {
  Fajr:    { en: 'Fajr',    ur: 'فجر'  },
  Dhuhr:   { en: 'Dhuhr',   ur: 'ظہر'  },
  Asr:     { en: 'Asr',     ur: 'عصر'  },
  Maghrib: { en: 'Maghrib', ur: 'مغرب' },
  Isha:    { en: 'Isha',    ur: 'عشاء' },
}

export const JOURNEY_LEVELS = [
  { en: 'Beginner',             ur: 'ابتدائی',                      minSessions: 0  },
  { en: 'Learner',              ur: 'سیکھنے والا',                   minSessions: 3  },
  { en: 'Practicing Muazzin',   ur: 'پریکٹس کرنے والا مؤذن',         minSessions: 8  },
  { en: 'Confident Muazzin',    ur: 'پُراعتماد مؤذن',                minSessions: 15 },
]
