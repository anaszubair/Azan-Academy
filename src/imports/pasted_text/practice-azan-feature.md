# Build a Bilingual "Practice Azan" Feature for Quran Majeed App

Create a beautiful, fully functional **Practice Azan** mobile app prototype for the Quran Majeed App ecosystem.

The feature must support **both English and Urdu** throughout the entire user experience.

The user should be able to switch between:

**English | اردو**

The selected language must be remembered throughout the app.

---

## 1. Main Feature

The feature allows users to:

* Select an Azan from the available Azan library
* Listen to the selected Azan
* Practice Azan phrase-by-phrase
* Record their own voice
* Listen to the reference recording
* Listen to their own recording
* Practice again
* Practice the complete Azan
* Track their practice progress

Use demo/sample Azan data and audio for the prototype.

Structure the code so that the real Quran Majeed Azan library can be connected later.

---

# 2. Language System

Add a language selector in Settings and preferably also on the Practice Azan screen.

Languages:

### English

### اردو

When English is selected:

**Practice Azan**

**Select an Azan**

**Listen**

**Practice**

**Start Recording**

**My Recording**

**Practice Again**

**Next Phrase**

**Complete Azan Practice**

**My Progress**

**Today's Practice**

When Urdu is selected:

**اذان کی پریکٹس**

**اذان منتخب کریں**

**سنیں**

**پریکٹس کریں**

**ریکارڈنگ شروع کریں**

**میری ریکارڈنگ**

**دوبارہ پریکٹس کریں**

**اگلا جملہ**

**مکمل اذان کی پریکٹس**

**میری کارکردگی**

**آج کی پریکٹس**

---

# 3. RTL / LTR

English interface:

**LTR**

Urdu interface:

**RTL**

When Urdu is selected:

* Text alignment should become RTL
* Icons and navigation should adapt appropriately
* Cards should support RTL
* Progress indicators should work correctly
* Arabic text remains RTL
* Buttons should have natural Urdu layout

Do not simply translate text while keeping the English layout.

The complete UI must properly adapt between LTR and RTL.

---

# 4. Practice Azan Home

English:

### Practice Azan

**Practice with your favorite Azan**

Urdu:

### اذان کی پریکٹس

**اپنی پسند کی اذان کے ساتھ پریکٹس کریں**

Main cards:

### 🎧 Select Azan

Choose the Azan you want to practice.

Urdu:

### 🎧 اذان منتخب کریں

پریکٹس کے لیے اپنی پسند کی اذان منتخب کریں۔

---

### 🎙️ Practice Azan

Practice phrase-by-phrase or practice the complete Azan.

Urdu:

### 🎙️ اذان کی پریکٹس

اذان کے جملوں کی الگ الگ یا مکمل اذان کی پریکٹس کریں۔

---

### 📊 My Progress

Track your practice sessions and improvement.

Urdu:

### 📊 میری کارکردگی

اپنی پریکٹس اور بہتری کا ریکارڈ دیکھیں۔

---

# 5. Select Azan Screen

English:

### Select Azan

**Choose an Azan for your practice**

Urdu:

### اذان منتخب کریں

**پریکٹس کے لیے اپنی پسند کی اذان منتخب کریں**

Each Azan card:

**Sheikh Al-Hudhaifi**

▶ Listen

**Practice**

Urdu:

**شیخ الحذیفی**

▶ سنیں

**پریکٹس کریں**

Include:

* Muazzin name
* Duration
* Play button
* Favorite button
* Practice button

---

# 6. Search & Filter

English:

**Search Azan or Muazzin**

Urdu:

**اذان یا مؤذن تلاش کریں**

Filters:

English:

**All | Fajr | Dhuhr | Asr | Maghrib | Isha**

Urdu:

**تمام | فجر | ظہر | عصر | مغرب | عشاء**

---

# 7. Azan Preview

English:

### Selected Azan

**Muazzin**

Sheikh Al-Hudhaifi

Buttons:

**▶ Listen to Full Azan**

**Start Practice**

Urdu:

### منتخب کردہ اذان

**مؤذن**

شیخ الحذیفی

Buttons:

**▶ مکمل اذان سنیں**

**پریکٹس شروع کریں**

---

# 8. Practice Mode

Allow the user to choose:

### Phrase by Phrase

### Complete Azan

Urdu:

### ایک ایک جملے کی پریکٹس

### مکمل اذان کی پریکٹس

Default:

**Phrase by Phrase**

---

# 9. Phrase Practice Screen

English:

### Practice Azan

**Phrase 2 of 8**

Urdu:

### اذان کی پریکٹس

**8 میں سے جملہ 2**

Display Arabic prominently.

Example:

**الله أكبر، الله أكبر**

Below it:

English:

**Allah is the Greatest, Allah is the Greatest**

Urdu:

**اللہ سب سے بڑا ہے، اللہ سب سے بڑا ہے**

Use verified religious text.

Do not generate or modify Arabic Azan text dynamically.

---

# 10. Reference Audio

English:

### Reference Azan

**Listen**

**Replay**

Urdu:

### اصل اذان

**سنیں**

**دوبارہ سنیں**

The reference audio should play the currently selected Azan phrase.

---

# 11. User Recording

English:

### Your Practice

🎙️

**Tap to Record**

Urdu:

### آپ کی پریکٹس

🎙️

**ریکارڈ کرنے کے لیے دبائیں**

During recording:

English:

🔴 Recording...

Urdu:

🔴 ریکارڈنگ جاری ہے...

Buttons:

**Stop**

**دوبارہ ریکارڈ کریں**

Urdu:

**روکیں**

**دوبارہ ریکارڈ کریں**

---

# 12. Compare Recordings

After recording:

English:

### Listen & Compare

**Reference Azan**
▶ Play

**My Recording**
▶ Play

Buttons:

**Practice Again**

**Next Phrase**

Urdu:

### سنیں اور موازنہ کریں

**اصل اذان**
▶ چلائیں

**میری ریکارڈنگ**
▶ چلائیں

Buttons:

**دوبارہ پریکٹس کریں**

**اگلا جملہ**

---

# 13. Complete Azan Practice

English:

### Complete Azan Practice

**Listen to the complete Azan, then record your own Azan.**

Urdu:

### مکمل اذان کی پریکٹس

**پہلے مکمل اذان سنیں، پھر اپنی اذان ریکارڈ کریں۔**

Buttons:

**▶ Listen to Reference**

**🎙️ Start Recording**

Urdu:

**▶ اصل اذان سنیں**

**🎙️ ریکارڈنگ شروع کریں**

After recording:

**▶ My Azan**

**Practice Again**

**Save Practice**

Urdu:

**▶ میری اذان**

**دوبارہ پریکٹس کریں**

**پریکٹس محفوظ کریں**

---

# 14. Practice Completion

English:

### Practice Complete 🎉

**MashAllah! You completed this practice session.**

Urdu:

### پریکٹس مکمل ہوگئی 🎉

**ماشاءاللہ! آپ نے یہ پریکٹس مکمل کرلی۔**

Show:

**Phrases Completed: 8/8**

Urdu:

**مکمل کیے گئے جملے: 8/8**

**Practice Attempts**

Urdu:

**پریکٹس کی کوششیں**

**Practice Time**

Urdu:

**پریکٹس کا وقت**

---

# 15. Practice Feedback

Create a learning feedback section.

English:

### Practice Feedback

Possible categories:

* Timing
* Pauses
* Phrase sequence
* Voice clarity

Urdu:

### پریکٹس کی رائے

* وقت اور رفتار
* وقفے
* جملوں کی ترتیب
* آواز کی وضاحت

IMPORTANT:

Do NOT say that the Azan is religiously valid or invalid.

Do NOT present AI feedback as a religious ruling.

Use:

**Practice feedback is for learning assistance only.**

Urdu:

**پریکٹس کی رائے صرف سیکھنے میں مدد کے لیے ہے۔**

---

# 16. One Phrase a Day

English:

### 🕌 Today's Azan Practice

**Learn and practice one Azan phrase in just 2 minutes.**

Button:

**Start Today's Practice**

Urdu:

### 🕌 آج کی اذان پریکٹس

**صرف 2 منٹ میں آج کا ایک جملہ سیکھیں اور پریکٹس کریں۔**

Button:

**آج کی پریکٹس شروع کریں**

Flow:

**Listen → Repeat → Record → Complete**

Urdu:

**سنیں → دہرائیں → ریکارڈ کریں → مکمل کریں**

---

# 17. My Progress

English:

### My Progress

Show:

**Practice Sessions**
12

**Phrases Completed**
48

**Total Practice Time**
34 min

**Current Streak**
5 days

Urdu:

### میری کارکردگی

**پریکٹس سیشنز**
12

**مکمل کیے گئے جملے**
48

**کل پریکٹس کا وقت**
34 منٹ

**مسلسل پریکٹس**
5 دن

---

# 18. Muazzin Journey

English:

### Muazzin Journey

Levels:

**Beginner**

**Learner**

**Practicing Muazzin**

**Confident Muazzin**

Urdu:

### مؤذن بننے کا سفر

Levels:

**ابتدائی**

**سیکھنے والا**

**پریکٹس کرنے والا مؤذن**

**پُراعتماد مؤذن**

Example:

English:

**MashAllah! You completed 7 practice sessions.**

Urdu:

**ماشاءاللہ! آپ نے 7 پریکٹس سیشنز مکمل کیے۔**

Keep gamification respectful and subtle.

---

# 19. Favorites

English:

### Favorite Azans

Urdu:

### پسندیدہ اذانیں

Allow users to add/remove Azans from favorites.

The favorite state should persist after restarting the app.

---

# 20. Language Settings

Create:

### Language

Options:

**English**

**اردو**

When the user changes language:

* UI text changes immediately
* Layout changes between LTR and RTL
* Navigation adapts
* Buttons adapt
* Progress screens adapt
* Error messages adapt
* Empty states adapt

Save the selected language locally.

---

# 21. Audio Data Architecture

Each Azan should contain:

```text
id
muazzinName
title
audioUrl
duration
prayerType
isFavorite
phrases[]
```

Each phrase:

```text
id
arabicText
translationEn
translationUr
startTime
endTime
audioUrl
```

This allows the same Arabic content to be displayed with either English or Urdu translation.

---

# 22. Technical Architecture

Keep UI and data completely separate.

Create services/repositories:

```text
AzanRepository
PracticeRepository
AudioService
RecordingService
ProgressService
LanguageService
```

Use:

```text
DemoAzanRepository
```

for the prototype.

Later this can be replaced with:

```text
QMAzanRepository
```

to connect Quran Majeed's real Azan library.

Do not hard-code one specific Azan.

The selected Azan must dynamically control:

* Muazzin name
* Reference audio
* Phrase list
* Duration
* Practice content

---

# 23. Recording

Implement actual microphone recording where supported.

Support:

* Permission request
* Start
* Stop
* Playback
* Delete
* Record again
* Save session

English permission message:

**Microphone permission is required to record your practice.**

Urdu:

**آپ کی پریکٹس ریکارڈ کرنے کے لیے مائیکروفون کی اجازت ضروری ہے۔**

---

# 24. Empty States

English:

### No Azans Available

**Azan recordings are not available right now. Please try again later.**

Button:

**Retry**

Urdu:

### کوئی اذان دستیاب نہیں

**اس وقت اذان کی ریکارڈنگ دستیاب نہیں۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔**

Button:

**دوبارہ کوشش کریں**

---

# 25. Final User Journey

English:

**Practice Azan**

↓

**Select Azan**

↓

**Listen**

↓

**Choose Practice Mode**

↓

**Practice Phrase**

↓

**Record**

↓

**Listen to Reference & My Recording**

↓

**Practice Again / Next Phrase**

↓

**Complete Azan**

↓

**Practice Feedback**

↓

**Save Progress**

Urdu:

**اذان کی پریکٹس**

↓

**اذان منتخب کریں**

↓

**سنیں**

↓

**پریکٹس کا طریقہ منتخب کریں**

↓

**جملے کی پریکٹس کریں**

↓

**ریکارڈ کریں**

↓

**اصل اذان اور اپنی ریکارڈنگ سنیں**

↓

**دوبارہ پریکٹس / اگلا جملہ**

↓

**مکمل اذان**

↓

**پریکٹس کی رائے**

↓

**پروگریس محفوظ کریں**

---

# 26. Final Requirement

The final prototype must look and feel like a **real Quran Majeed App feature**, not a generic demo.

It must be:

* Beautiful
* Bilingual
* Fully responsive
* RTL/LTR aware
* Functional
* Easy to use
* Respectful of Islamic content
* Modular
* Ready for future QM integration

Most importantly, the entire feature must work in **both English and Urdu**, with a proper language switch and appropriate RTL/LTR layouts.
