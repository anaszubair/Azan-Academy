import { useState, useRef, useEffect, useCallback } from 'react'
import {
  type Lang, type AzanEntry, type PrayerType,
  DEMO_AZANS, PRAYER_LABELS, JOURNEY_LEVELS, tx,
} from './data/azanData'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type T = {
  bg: string; fg: string; card: string; cardFg: string; surface2: string; border: string
  muted: string; mutedBg: string; primary: string; primaryLight: string; gold: string
  goldLight: string; red: string; redLight: string
}

type PScreen =
  | 'home' | 'select-azan' | 'preview' | 'mode-select'
  | 'phrase-practice' | 'compare' | 'complete-practice'
  | 'completion' | 'my-progress' | 'settings'

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

function uiFont(lang: Lang) {
  return lang === 'ur' ? "'Noto Nastaliq Urdu', serif" : "'Inter', sans-serif"
}

function LangToggle({ lang, setLang, t }: { lang: Lang; setLang: (l: Lang) => void; t: T }) {
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
      className="flex items-center rounded-full text-xs font-semibold overflow-hidden flex-shrink-0"
      style={{ background: t.surface2, border: `1px solid ${t.border}` }}
    >
      <span
        className="px-2.5 py-1.5 transition-all"
        style={{ background: lang === 'en' ? t.primary : 'transparent', color: lang === 'en' ? '#FFF' : t.muted }}
      >
        EN
      </span>
      <span
        className="px-2.5 py-1.5 transition-all"
        style={{
          background: lang === 'ur' ? t.primary : 'transparent',
          color: lang === 'ur' ? '#FFF' : t.muted,
          fontFamily: "'Noto Nastaliq Urdu', serif",
        }}
      >
        اردو
      </span>
    </button>
  )
}

function PHeader({
  title, lang, onBack, rightSlot, t,
}: {
  title: string; lang: Lang; onBack?: () => void; rightSlot?: React.ReactNode; t: T
}) {
  const isRTL = lang === 'ur'
  return (
    <div
      className="flex items-center px-4 py-3 gap-3 flex-shrink-0"
      style={{ borderBottom: `1px solid ${t.border}`, background: t.card, direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-70"
          style={{ background: t.surface2, color: t.fg }}
        >
          {isRTL ? '→' : '←'}
        </button>
      )}
      <h2 className="flex-1 text-center text-[15px] font-semibold" style={{ color: t.fg, fontFamily: uiFont(lang) }}>
        {title}
      </h2>
      <div className="flex-shrink-0">{rightSlot ?? <div className="w-8" />}</div>
    </div>
  )
}

function Waveform({ playing, color }: { playing: boolean; color: string }) {
  const hs = [4, 10, 6, 18, 12, 22, 14, 22, 12, 18, 8, 14, 6, 10, 4]
  return (
    <div className="flex items-center gap-[2px] h-6">
      {hs.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all"
          style={{
            height: playing ? `${h}px` : '3px',
            background: color,
            animation: playing ? `waveBar 0.6s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
            ['--wave-h' as string]: `${h}px`,
          }}
        />
      ))}
    </div>
  )
}

// ─── SCREEN: HOME ─────────────────────────────────────────────────────────────

function PracticeHome({
  lang, setLang, t, nav, selectedAzan, stats,
}: {
  lang: Lang; setLang: (l: Lang) => void; t: T; nav: (s: PScreen) => void
  selectedAzan: AzanEntry | null; stats: { sessions: number; phrases: number; streak: number }
}) {
  const isRTL = lang === 'ur'
  const dir = isRTL ? 'rtl' : 'ltr'

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar" dir={dir}>
      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-5 pb-5" style={{ background: t.primaryLight }}>
        {/* Geometric pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geopf" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
              <g fill="none" stroke={t.primary} strokeWidth="0.7" opacity="0.12">
                <polygon points="28,6 33,18 46,18 36,26 40,38 28,30 16,38 20,26 10,18 23,18" />
                <rect x="16" y="16" width="24" height="24" transform="rotate(45 28 28)" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geopf)" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <LangToggle lang={lang} setLang={setLang} t={t} />
            <div className="text-xs font-semibold tracking-widest" style={{ color: t.gold }}>QURAN MAJEED</div>
          </div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: t.primary, fontFamily: lang === 'ur' ? "'Noto Nastaliq Urdu', serif" : "'Inter', sans-serif", textAlign: isRTL ? 'right' : 'left' }}
          >
            {tx(lang, 'practiceAzan')}
          </h1>
          <p className="text-sm mb-4" style={{ color: t.muted, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {lang === 'en' ? 'Practice with your favorite Azan' : 'اپنی پسند کی اذان کے ساتھ پریکٹس کریں'}
          </p>

          {/* Daily practice card */}
          <div className="rounded-2xl p-4" style={{ background: t.primary }}>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-2xl flex-shrink-0">🕌</span>
              <div className={`flex-1 ${isRTL ? 'text-right' : ''}`}>
                <p className="text-white font-bold text-sm" style={{ fontFamily: uiFont(lang) }}>
                  {tx(lang, 'todaysPractice')}
                </p>
                <p className="text-white text-xs opacity-70 mt-0.5" style={{ fontFamily: uiFont(lang) }}>
                  {lang === 'en' ? 'Learn one phrase in 2 minutes' : 'صرف 2 منٹ میں ایک جملہ سیکھیں'}
                </p>
              </div>
              <button
                onClick={() => nav('mode-select')}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', fontFamily: uiFont(lang) }}
              >
                {lang === 'en' ? 'Start' : 'شروع'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        {[
          { value: stats.sessions, labelEn: 'Sessions', labelUr: 'سیشنز' },
          { value: stats.phrases,  labelEn: 'Phrases',  labelUr: 'جملے' },
          { value: `${stats.streak}d`, labelEn: 'Streak', labelUr: 'مسلسل' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-xl text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
            <p className="text-xl font-bold" style={{ color: t.primary }}>{s.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: t.muted, fontFamily: uiFont(lang) }}>
              {lang === 'en' ? s.labelEn : s.labelUr}
            </p>
          </div>
        ))}
      </div>

      {/* Main cards */}
      <div className="px-4 mt-3 pb-4 space-y-3">
        {[
          {
            emoji: '🎧', screen: 'select-azan' as PScreen,
            titleEn: 'Select Azan', titleUr: 'اذان منتخب کریں',
            descEn: 'Choose the Azan you want to practice',
            descUr: 'پریکٹس کے لیے اپنی پسند کی اذان منتخب کریں',
            bg: t.card,
          },
          {
            emoji: '🎙️', screen: 'mode-select' as PScreen,
            titleEn: 'Practice Azan', titleUr: 'اذان کی پریکٹس',
            descEn: 'Practice phrase-by-phrase or full Azan',
            descUr: 'ایک ایک جملے یا مکمل اذان کی پریکٹس کریں',
            bg: t.goldLight,
          },
          {
            emoji: '📊', screen: 'my-progress' as PScreen,
            titleEn: 'My Progress', titleUr: 'میری کارکردگی',
            descEn: 'Track your practice sessions and improvement',
            descUr: 'اپنی پریکٹس اور بہتری کا ریکارڈ دیکھیں',
            bg: t.card,
          },
        ].map((card) => (
          <button
            key={card.screen}
            onClick={() => nav(card.screen)}
            className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-opacity hover:opacity-90 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ background: card.bg, border: `1.5px solid ${t.border}` }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: t.primaryLight }}>
              {card.emoji}
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm font-bold mb-0.5" style={{ color: t.cardFg, fontFamily: uiFont(lang) }}>
                {lang === 'en' ? card.titleEn : card.titleUr}
              </p>
              <p className="text-xs" style={{ color: t.muted, fontFamily: uiFont(lang), lineHeight: lang === 'ur' ? '2' : '1.5' }}>
                {lang === 'en' ? card.descEn : card.descUr}
              </p>
            </div>
            <span style={{ color: t.muted, transform: isRTL ? 'scaleX(-1)' : 'none' }}>›</span>
          </button>
        ))}

        {/* Settings link */}
        <button
          onClick={() => nav('settings')}
          className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-opacity hover:opacity-80 ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ background: t.surface2, border: `1px solid ${t.border}` }}
        >
          <span className="text-lg">⚙️</span>
          <span className="text-sm font-medium" style={{ color: t.muted, fontFamily: uiFont(lang) }}>
            {tx(lang, 'settings')} — {tx(lang, 'language')}: {lang === 'en' ? 'English' : 'اردو'}
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── SCREEN: SELECT AZAN ──────────────────────────────────────────────────────

function SelectAzanScreen({
  lang, t, onBack, onSelect, favorites, toggleFav,
}: {
  lang: Lang; t: T; onBack: () => void; onSelect: (a: AzanEntry) => void
  favorites: Set<string>; toggleFav: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<PrayerType | 'All'>('All')
  const isRTL = lang === 'ur'
  const dir = isRTL ? 'rtl' : 'ltr'

  const prayers: (PrayerType | 'All')[] = ['All', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

  const filtered = DEMO_AZANS.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.muazzinEn.toLowerCase().includes(q) || a.muazzinUr.includes(q) || a.titleEn.toLowerCase().includes(q)
    const matchFilter = filter === 'All' || a.prayerType === filter
    return matchSearch && matchFilter
  })

  const prayerLabel = (p: PrayerType | 'All') =>
    p === 'All' ? tx(lang, 'all') : PRAYER_LABELS[p][lang]

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir={dir}>
      <PHeader
        title={tx(lang, 'selectAzan')} lang={lang} onBack={onBack} t={t}
      />

      {/* Search */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: `1px solid ${t.border}` }}>
        <div className="relative">
          <span className={`absolute top-1/2 -translate-y-1/2 text-base ${isRTL ? 'right-3' : 'left-3'}`} style={{ color: t.muted }}>🔍</span>
          <input
            className="w-full py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: t.surface2,
              color: t.fg,
              border: `1px solid ${t.border}`,
              paddingLeft: isRTL ? '12px' : '36px',
              paddingRight: isRTL ? '36px' : '12px',
              fontFamily: uiFont(lang),
              direction: dir,
            }}
            placeholder={tx(lang, 'search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar pb-1">
          {prayers.map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === p ? t.primary : t.mutedBg,
                color: filter === p ? '#FFF' : t.muted,
                fontFamily: uiFont(lang),
              }}
            >
              {prayerLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <span className="text-4xl opacity-30">🔇</span>
            <p className="text-sm" style={{ color: t.muted, fontFamily: uiFont(lang) }}>{tx(lang, 'noAzans')}</p>
            <button className="px-4 py-2 rounded-xl text-sm" style={{ background: t.primaryLight, color: t.primary, fontFamily: uiFont(lang) }}>
              {tx(lang, 'retry')}
            </button>
          </div>
        ) : filtered.map(azan => (
          <div
            key={azan.id}
            className="p-4 rounded-2xl"
            style={{ background: favorites.has(azan.id) ? t.goldLight : t.card, border: `1.5px solid ${favorites.has(azan.id) ? t.gold + '50' : t.border}` }}
          >
            <div className={`flex items-start justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: t.primaryLight }}>
                  🕌
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <p className="text-sm font-bold" style={{ color: t.cardFg, fontFamily: uiFont(lang) }}>
                    {lang === 'en' ? azan.muazzinEn : azan.muazzinUr}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: t.muted, fontFamily: uiFont(lang) }}>
                    {lang === 'en' ? azan.titleEn : azan.titleUr}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ background: t.primaryLight, color: t.primary, fontFamily: uiFont(lang) }}>
                  {prayerLabel(azan.prayerType)}
                </span>
                <button onClick={() => toggleFav(azan.id)} className="text-lg">
                  {favorites.has(azan.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs" style={{ color: t.muted }}>⏱ {azan.duration}</span>
              <div className="flex-1" />
              <button
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: t.primaryLight, color: t.primary, fontFamily: uiFont(lang) }}
              >
                {lang === 'en' ? '▶ Listen' : '▶ سنیں'}
              </button>
              <button
                onClick={() => onSelect(azan)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: t.primary, fontFamily: uiFont(lang) }}
              >
                {tx(lang, 'practice')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SCREEN: AZAN PREVIEW ─────────────────────────────────────────────────────

function AzanPreviewScreen({
  lang, t, onBack, azan, onStartPractice,
}: {
  lang: Lang; t: T; onBack: () => void; azan: AzanEntry; onStartPractice: () => void
}) {
  const isRTL = lang === 'ur'
  const [playing, setPlaying] = useState(false)
  const play = () => { setPlaying(true); setTimeout(() => setPlaying(false), 5000) }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <PHeader title={tx(lang, 'selected')} lang={lang} onBack={onBack} t={t} />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-4 space-y-4">
        {/* Azan card */}
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F2D1A 0%, #1A6645 100%)' }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="geopre" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
              <g fill="none" stroke="#FFF" strokeWidth="0.7"><polygon points="28,6 33,18 46,18 36,26 40,38 28,30 16,38 20,26 10,18 23,18" /></g>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#geopre)" />
          </svg>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold tracking-widest text-white opacity-60 mb-2">{tx(lang, 'muazzin').toUpperCase()}</p>
            <p className="text-lg font-bold text-white mb-0.5" style={{ fontFamily: uiFont(lang) }}>
              {lang === 'en' ? azan.muazzinEn : azan.muazzinUr}
            </p>
            <p className="text-sm text-white opacity-70" style={{ fontFamily: uiFont(lang) }}>
              {lang === 'en' ? azan.titleEn : azan.titleUr}
            </p>
            <div className={`flex items-center gap-3 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFF', fontFamily: uiFont(lang) }}>
                {PRAYER_LABELS[azan.prayerType][lang]}
              </span>
              <span className="text-xs text-white opacity-60">⏱ {azan.duration}</span>
            </div>
            {playing && <div className="mt-3"><Waveform playing={true} color="#FFFFFF" /></div>}
          </div>
        </div>

        {/* Phrase preview */}
        <div style={{ background: t.card, border: `1px solid ${t.border}` }} className="rounded-2xl p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: t.muted, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {lang === 'en' ? `${azan.phrases.length} Phrases` : `${azan.phrases.length} جملے`}
          </p>
          {azan.phrases.slice(0, 3).map(p => (
            <div key={p.id} className="py-2.5" style={{ borderBottom: `1px solid ${t.border}` }}>
              <p className="text-xl font-bold leading-loose text-right" style={{ fontFamily: "'Amiri', serif", color: t.primary, direction: 'rtl' }}>
                {p.arabic}
              </p>
              <p className="text-xs mt-0.5" style={{ color: t.muted, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
                {lang === 'en' ? p.transEn : p.transUr}
              </p>
            </div>
          ))}
          {azan.phrases.length > 3 && (
            <p className="text-xs mt-2 text-center" style={{ color: t.muted }}>
              +{azan.phrases.length - 3} more
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={play}
            className={`w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-3 transition-opacity hover:opacity-80 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ background: t.primaryLight, color: t.primary, border: `1px solid ${t.primary}30`, fontFamily: uiFont(lang) }}
          >
            <span>▶</span> {tx(lang, 'fullAzanListen')}
          </button>
          <button
            onClick={onStartPractice}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-3 transition-opacity hover:opacity-90 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ background: t.primary, fontFamily: uiFont(lang) }}
          >
            <span>🎙️</span> {tx(lang, 'startPractice')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN: MODE SELECT ──────────────────────────────────────────────────────

function ModeSelectScreen({
  lang, t, onBack, onSelect,
}: {
  lang: Lang; t: T; onBack: () => void; onSelect: (mode: 'phrase' | 'complete') => void
}) {
  const isRTL = lang === 'ur'
  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <PHeader title={tx(lang, 'choosePractice')} lang={lang} onBack={onBack} t={t} />
      <div className="flex-1 flex flex-col justify-center px-4 gap-4">
        {[
          {
            mode: 'phrase' as const,
            emoji: '🎯',
            titleEn: 'Phrase by Phrase',
            titleUr: 'ایک ایک جملے کی پریکٹس',
            descEn: 'Learn and practice each phrase individually',
            descUr: 'ہر جملہ الگ الگ سیکھیں اور پریکٹس کریں',
            recommended: true,
          },
          {
            mode: 'complete' as const,
            emoji: '📿',
            titleEn: 'Complete Azan',
            titleUr: 'مکمل اذان کی پریکٹس',
            descEn: 'Listen then record the full Azan',
            descUr: 'پہلے سنیں پھر پوری اذان ریکارڈ کریں',
            recommended: false,
          },
        ].map(card => (
          <button
            key={card.mode}
            onClick={() => onSelect(card.mode)}
            className={`p-5 rounded-3xl flex items-center gap-4 transition-opacity hover:opacity-90 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{
              background: card.recommended ? t.primaryLight : t.card,
              border: `2px solid ${card.recommended ? t.primary : t.border}`,
            }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: card.recommended ? t.primary : t.mutedBg }}>
              {card.emoji}
            </div>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {card.recommended && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold mb-1 inline-block"
                  style={{ background: t.gold + '20', color: t.gold, fontFamily: uiFont(lang) }}>
                  {lang === 'en' ? 'Recommended' : 'تجویز کردہ'}
                </span>
              )}
              <p className="text-base font-bold" style={{ color: t.cardFg, fontFamily: uiFont(lang) }}>
                {lang === 'en' ? card.titleEn : card.titleUr}
              </p>
              <p className="text-xs mt-1" style={{ color: t.muted, fontFamily: uiFont(lang), lineHeight: lang === 'ur' ? '2' : '1.5' }}>
                {lang === 'en' ? card.descEn : card.descUr}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── SCREEN: PHRASE PRACTICE ──────────────────────────────────────────────────

function PhrasePracticeScreen({
  lang, t, onBack, azan, phraseIdx, setPhraseIdx, onCompare, onFinish,
}: {
  lang: Lang; t: T; onBack: () => void; azan: AzanEntry; phraseIdx: number
  setPhraseIdx: (i: number) => void; onCompare: (url: string | null) => void; onFinish: () => void
}) {
  const isRTL = lang === 'ur'
  const phrase = azan.phrases[phraseIdx]
  const [refPlaying, setRefPlaying] = useState(false)
  const [recState, setRecState] = useState<'idle' | 'recording' | 'recorded'>('idle')
  const [recSecs, setRecSecs] = useState(0)
  const [recUrl, setRecUrl] = useState<string | null>(null)
  const [micDenied, setMicDenied] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const playRef = () => {
    setRefPlaying(true)
    setTimeout(() => setRefPlaying(false), 3500)
  }

  const startRecording = async () => {
    setRecUrl(null)
    setRecSecs(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const rec = new MediaRecorder(stream)
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecUrl(url)
        stream.getTracks().forEach(tr => tr.stop())
        setRecState('recorded')
        if (timerRef.current) clearInterval(timerRef.current)
      }
      rec.start()
      mediaRecRef.current = rec
      setRecState('recording')
      timerRef.current = setInterval(() => setRecSecs(s => s + 1), 1000)
    } catch {
      setMicDenied(true)
      // Simulation fallback
      setRecState('recording')
      timerRef.current = setInterval(() => setRecSecs(s => s + 1), 1000)
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecRef.current?.state === 'recording') {
      mediaRecRef.current.stop()
    } else {
      setRecState('recorded')
    }
  }

  const resetRec = () => { setRecState('idle'); setRecSecs(0); setRecUrl(null) }

  const playMyRec = () => {
    if (audioRef.current && recUrl) {
      audioRef.current.src = recUrl
      audioRef.current.play()
    }
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={audioRef} />
      <PHeader
        title={tx(lang, 'practiceAzan')} lang={lang} onBack={onBack} t={t}
        rightSlot={
          <span className="text-xs font-medium" style={{ color: t.muted, fontFamily: uiFont(lang) }}>
            {lang === 'en'
              ? `${phraseIdx + 1} / ${azan.phrases.length}`
              : `${azan.phrases.length} میں سے ${phraseIdx + 1}`}
          </span>
        }
      />

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col px-4 pt-4 pb-4 gap-4">
        {/* Step bar */}
        <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {azan.phrases.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i <= phraseIdx ? t.primary : t.border }} />
          ))}
        </div>

        {/* Arabic card */}
        <div
          className="rounded-3xl p-5 flex flex-col items-center relative overflow-hidden transition-all duration-300"
          style={{ background: refPlaying ? t.primaryLight : t.card, border: `1.5px solid ${refPlaying ? t.primary : t.border}` }}
        >
          {refPlaying && <div className="mb-2"><Waveform playing={true} color={t.primary} /></div>}
          <p className="text-4xl font-bold text-center leading-loose mb-2" style={{ fontFamily: "'Amiri', serif", color: t.primary, direction: 'rtl' }}>
            {phrase.arabic}
          </p>
          <div className="w-10 h-px my-1" style={{ background: `${t.gold}60` }} />
          <p className="text-sm text-center" style={{ fontFamily: uiFont(lang), color: t.fg, textAlign: 'center', lineHeight: lang === 'ur' ? '2' : '1.5' }}>
            {lang === 'en' ? phrase.transEn : phrase.transUr}
          </p>
        </div>

        {/* Reference section */}
        <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <p className="text-xs font-semibold mb-3" style={{ color: t.muted, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'referenceAzan')}
          </p>
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={playRef}
              className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all"
              style={{ background: refPlaying ? t.primary : t.primaryLight, color: refPlaying ? '#FFF' : t.primary, fontFamily: uiFont(lang) }}
            >
              {refPlaying ? <Waveform playing={true} color="#FFF" /> : <span>▶</span>}
              {!refPlaying && tx(lang, 'listen')}
            </button>
            <button
              onClick={playRef}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: t.surface2, color: t.fg, fontFamily: uiFont(lang) }}
            >
              {tx(lang, 'replay')}
            </button>
          </div>
        </div>

        {/* Recording section */}
        <div className="rounded-2xl p-4" style={{ background: recState === 'recording' ? '#FEF2F2' : t.card, border: `1px solid ${recState === 'recording' ? t.red : t.border}` }}>
          <p className="text-xs font-semibold mb-3" style={{ color: t.muted, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'yourPractice')}
          </p>

          {micDenied && recState !== 'recording' && (
            <div className="mb-3 p-3 rounded-xl" style={{ background: t.goldLight }}>
              <p className="text-xs text-center" style={{ color: t.gold, fontFamily: uiFont(lang), lineHeight: '2' }}>
                {tx(lang, 'micPermission')}
              </p>
            </div>
          )}

          {recState === 'idle' && (
            <button
              onClick={startRecording}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-3 font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: t.primary, color: '#FFF', fontFamily: uiFont(lang) }}
            >
              <span>🎙️</span> {tx(lang, 'tapToRecord')}
            </button>
          )}

          {recState === 'recording' && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold" style={{ color: t.red, fontFamily: uiFont(lang) }}>
                {tx(lang, 'recording')} {fmt(recSecs)}
              </p>
              <div className="flex gap-[3px]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-1.5 rounded-full" style={{ height: '4px', background: t.red, animation: `waveBar 0.5s ease-in-out ${i * 0.07}s infinite alternate`, ['--wave-h' as string]: `${8 + (i % 3) * 6}px` }} />
                ))}
              </div>
              <button
                onClick={stopRecording}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: t.red, color: '#FFF', fontFamily: uiFont(lang) }}
              >
                ⏹ {tx(lang, 'stop')}
              </button>
            </div>
          )}

          {recState === 'recorded' && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: t.primaryLight }}>🎵</div>
                <p className="text-sm font-medium" style={{ color: t.fg, fontFamily: uiFont(lang) }}>
                  {tx(lang, 'myRecording')} ({fmt(recSecs)})
                </p>
              </div>
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button onClick={playMyRec} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: t.primaryLight, color: t.primary, fontFamily: uiFont(lang) }}>
                  ▶ {lang === 'en' ? 'Play' : 'چلائیں'}
                </button>
                <button onClick={resetRec} className="flex-1 py-2 rounded-xl text-sm font-semibold" style={{ background: t.surface2, color: t.fg, fontFamily: uiFont(lang) }}>
                  🔄 {tx(lang, 'reRecord')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {recState === 'recorded' && (
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => onCompare(recUrl)}
              className="flex-1 py-3 rounded-2xl font-semibold text-sm"
              style={{ background: t.surface2, color: t.fg, fontFamily: uiFont(lang) }}
            >
              {tx(lang, 'listenCompare')}
            </button>
            <button
              onClick={() => {
                if (phraseIdx < azan.phrases.length - 1) {
                  setPhraseIdx(phraseIdx + 1)
                  resetRec()
                } else {
                  onFinish()
                }
              }}
              className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm"
              style={{ background: t.primary, fontFamily: uiFont(lang) }}
            >
              {phraseIdx < azan.phrases.length - 1 ? tx(lang, 'nextPhrase') : (lang === 'en' ? 'Finish ✓' : 'مکمل ✓')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SCREEN: COMPARE ─────────────────────────────────────────────────────────

function CompareScreen({
  lang, t, onBack, onPracticeAgain, onNextPhrase, recUrl,
}: {
  lang: Lang; t: T; onBack: () => void; onPracticeAgain: () => void; onNextPhrase: () => void; recUrl: string | null
}) {
  const isRTL = lang === 'ur'
  const [refPlay, setRefPlay] = useState(false)
  const [myPlay, setMyPlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playMine = () => {
    if (audioRef.current && recUrl) { audioRef.current.src = recUrl; audioRef.current.play() }
    setMyPlay(true); setTimeout(() => setMyPlay(false), 3000)
  }
  const playRef = () => { setRefPlay(true); setTimeout(() => setRefPlay(false), 3500) }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={audioRef} />
      <PHeader title={tx(lang, 'listenCompare')} lang={lang} onBack={onBack} t={t} />
      <div className="flex-1 flex flex-col px-4 pt-5 pb-5 gap-4 overflow-y-auto hide-scrollbar">
        {/* Reference */}
        <div className="p-5 rounded-3xl" style={{ background: t.primaryLight, border: `1.5px solid ${t.primary}30` }}>
          <p className="text-xs font-semibold mb-3" style={{ color: t.primary, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'referenceAzan')}
          </p>
          {refPlay && <div className="flex justify-center mb-2"><Waveform playing={true} color={t.primary} /></div>}
          <button
            onClick={playRef}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ background: refPlay ? t.primary : t.card, color: refPlay ? '#FFF' : t.primary, fontFamily: uiFont(lang) }}
          >
            <span>▶</span> {tx(lang, 'playRef')}
          </button>
        </div>

        {/* My recording */}
        <div className="p-5 rounded-3xl" style={{ background: t.goldLight, border: `1.5px solid ${t.gold}30` }}>
          <p className="text-xs font-semibold mb-3" style={{ color: t.gold, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'myRecording')}
          </p>
          {myPlay && <div className="flex justify-center mb-2"><Waveform playing={true} color={t.gold} /></div>}
          <button
            onClick={playMine}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ background: myPlay ? t.gold : t.card, color: myPlay ? '#FFF' : t.gold, fontFamily: uiFont(lang) }}
          >
            <span>▶</span> {tx(lang, 'playMine')}
          </button>
        </div>

        {/* Note */}
        <div className="p-3 rounded-xl" style={{ background: t.surface2 }}>
          <p className="text-[11px] text-center" style={{ color: t.muted, fontFamily: uiFont(lang), lineHeight: '2' }}>
            {tx(lang, 'feedbackNote')}
          </p>
        </div>

        <div className={`flex gap-3 mt-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button onClick={onPracticeAgain} className="flex-1 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: t.surface2, color: t.fg, fontFamily: uiFont(lang) }}>
            {tx(lang, 'practiceAgain')}
          </button>
          <button onClick={onNextPhrase} className="flex-1 py-3 rounded-2xl text-white font-semibold text-sm"
            style={{ background: t.primary, fontFamily: uiFont(lang) }}>
            {tx(lang, 'nextPhrase')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN: COMPLETION ───────────────────────────────────────────────────────

function CompletionScreen({
  lang, t, onPracticeAgain, onProgress, azan, sessionTime,
}: {
  lang: Lang; t: T; onPracticeAgain: () => void; onProgress: () => void
  azan: AzanEntry; sessionTime: number
}) {
  const isRTL = lang === 'ur'
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="flex-1 overflow-y-auto hide-scrollbar" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Celebration header */}
      <div className="relative overflow-hidden px-5 pt-8 pb-6 text-center" style={{ background: t.primaryLight }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="geocomp" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
            <g fill="none" stroke={t.primary} strokeWidth="0.7" opacity="0.12"><polygon points="28,6 33,18 46,18 36,26 40,38 28,30 16,38 20,26 10,18 23,18" /></g>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#geocomp)" />
        </svg>
        <div className="relative z-10">
          <div className="text-5xl mb-2">🕌</div>
          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Amiri', serif", color: t.primary }}>ماشاءاللہ!</h2>
          <h3 className="text-base font-semibold mb-1" style={{ fontFamily: uiFont(lang), color: t.fg }}>{tx(lang, 'practiceComplete')}</h3>
          <p className="text-sm" style={{ fontFamily: uiFont(lang), color: t.muted }}>{tx(lang, 'mashAllah')}</p>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: `${azan.phrases.length}/${azan.phrases.length}`, labelEn: 'Phrases', labelUr: 'جملے' },
            { value: '1', labelEn: 'Session', labelUr: 'سیشن' },
            { value: fmt(sessionTime), labelEn: 'Time', labelUr: 'وقت' },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-2xl text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
              <p className="text-xl font-bold" style={{ color: t.primary }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: t.muted, fontFamily: uiFont(lang) }}>
                {lang === 'en' ? s.labelEn : s.labelUr}
              </p>
            </div>
          ))}
        </div>

        {/* Feedback categories */}
        <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: t.fg, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'feedback')}
          </p>
          {[
            { en: 'Timing & Pace', ur: 'وقت اور رفتار', score: 4 },
            { en: 'Pauses', ur: 'وقفے', score: 3 },
            { en: 'Phrase Sequence', ur: 'جملوں کی ترتیب', score: 5 },
            { en: 'Voice Clarity', ur: 'آواز کی وضاحت', score: 4 },
          ].map((fb, i) => (
            <div key={i} className={`flex items-center gap-3 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className="text-xs flex-1" style={{ color: t.fg, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
                {lang === 'en' ? fb.en : fb.ur}
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className="w-4 h-1.5 rounded-full" style={{ background: s <= fb.score ? t.primary : t.border }} />
                ))}
              </div>
            </div>
          ))}
          <p className="text-[10px] mt-2 text-center" style={{ color: t.muted, fontFamily: uiFont(lang) }}>
            {tx(lang, 'feedbackNote')}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={onPracticeAgain} className="w-full py-3 rounded-2xl font-semibold text-sm"
            style={{ background: t.surface2, color: t.fg, fontFamily: uiFont(lang) }}>
            {tx(lang, 'practiceAgain')}
          </button>
          <button className="w-full py-3 rounded-2xl font-semibold text-sm"
            style={{ background: t.goldLight, color: t.gold, fontFamily: uiFont(lang) }}>
            {tx(lang, 'saveProgress')}
          </button>
          <button onClick={onProgress} className="w-full py-3 rounded-2xl text-white font-semibold text-sm"
            style={{ background: t.primary, fontFamily: uiFont(lang) }}>
            {tx(lang, 'myProgress')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN: MY PROGRESS ──────────────────────────────────────────────────────

function MyProgressScreen({ lang, t, onBack }: { lang: Lang; t: T; onBack: () => void }) {
  const isRTL = lang === 'ur'
  const sessionCount = 12
  const level = JOURNEY_LEVELS.reduce((acc, l) => sessionCount >= l.minSessions ? l : acc, JOURNEY_LEVELS[0])
  const nextLevel = JOURNEY_LEVELS[JOURNEY_LEVELS.indexOf(level) + 1]
  const lvlPct = nextLevel
    ? Math.round(((sessionCount - level.minSessions) / (nextLevel.minSessions - level.minSessions)) * 100)
    : 100

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <PHeader title={tx(lang, 'myProgress')} lang={lang} onBack={onBack} t={t} />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-4 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: '12', labelEn: 'Practice Sessions', labelUr: 'پریکٹس سیشنز', icon: '🎙️' },
            { value: '48', labelEn: 'Phrases Completed', labelUr: 'مکمل کیے گئے جملے', icon: '✓' },
            { value: `34 ${tx(lang, 'minutes')}`, labelEn: 'Total Practice Time', labelUr: 'کل پریکٹس کا وقت', icon: '⏱' },
            { value: `5 ${tx(lang, 'days')}`, labelEn: 'Current Streak', labelUr: 'مسلسل پریکٹس', icon: '🔥' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
              <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-lg">{s.icon}</span>
                <p className="text-[11px]" style={{ color: t.muted, fontFamily: uiFont(lang) }}>
                  {lang === 'en' ? s.labelEn : s.labelUr}
                </p>
              </div>
              <p className="text-2xl font-bold" style={{ color: t.primary, textAlign: isRTL ? 'right' : 'left' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Muazzin Journey */}
        <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: t.fg, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'muazzinJourney')}
          </p>
          <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0" style={{ background: t.primaryLight }}>🕌</div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: t.fg, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
                {lang === 'en' ? level.en : level.ur}
              </p>
              {nextLevel && (
                <p className="text-xs mt-0.5" style={{ color: t.muted, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
                  {lang === 'en' ? `Next: ${nextLevel.en}` : `اگلا: ${nextLevel.ur}`}
                </p>
              )}
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: t.mutedBg }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${lvlPct}%`, background: t.primary }} />
          </div>
          <p className="text-xs mt-1 font-medium" style={{ color: t.primary, textAlign: isRTL ? 'right' : 'left' }}>{lvlPct}%</p>

          {/* Journey levels */}
          <div className="mt-3 space-y-2">
            {JOURNEY_LEVELS.map((l, i) => (
              <div key={i} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: sessionCount >= l.minSessions ? t.primary : t.mutedBg, color: sessionCount >= l.minSessions ? '#FFF' : t.muted }}>
                  {sessionCount >= l.minSessions ? '✓' : i + 1}
                </div>
                <p className="text-xs font-medium" style={{ color: sessionCount >= l.minSessions ? t.fg : t.muted, fontFamily: uiFont(lang) }}>
                  {lang === 'en' ? l.en : l.ur}
                </p>
                <span className="text-[10px] ml-auto" style={{ color: t.muted }}>
                  {l.minSessions}+ {lang === 'en' ? 'sessions' : 'سیشن'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly streak */}
        <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: t.fg, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'todaysPractice')}
          </p>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {(lang === 'en'
              ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
              : ['م', 'ج', 'ب', 'س', 'پ', 'ہ', 'ا']
            ).map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                  style={{ background: i < 5 ? t.primary : t.mutedBg, color: i < 5 ? '#FFF' : t.muted }}>
                  {i < 5 ? '✓' : d}
                </div>
                <span className="text-[9px]" style={{ color: t.muted }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mashallah banner */}
        <div className="p-4 rounded-2xl text-center" style={{ background: t.goldLight, border: `1px solid ${t.gold}30` }}>
          <p className="text-base font-bold" style={{ fontFamily: "'Amiri', serif", color: t.primary }}>ماشاءاللہ!</p>
          <p className="text-sm mt-1" style={{ fontFamily: uiFont(lang), color: t.muted, lineHeight: lang === 'ur' ? '2' : '1.5' }}>
            {lang === 'en' ? 'MashAllah! You completed 12 practice sessions.' : 'ماشاءاللہ! آپ نے 12 پریکٹس سیشنز مکمل کیے۔'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN: SETTINGS ─────────────────────────────────────────────────────────

function SettingsScreen({
  lang, setLang, t, onBack, dark, onToggleDark,
}: {
  lang: Lang; setLang: (l: Lang) => void; t: T; onBack: () => void; dark: boolean; onToggleDark: () => void
}) {
  const isRTL = lang === 'ur'
  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <PHeader title={tx(lang, 'settings')} lang={lang} onBack={onBack} t={t} />
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-4 space-y-4">
        {/* Language */}
        <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: t.fg, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {tx(lang, 'language')}
          </p>
          {(['en', 'ur'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`w-full flex items-center justify-between p-3 rounded-xl mb-2 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{ background: lang === l ? t.primaryLight : t.surface2, border: `1.5px solid ${lang === l ? t.primary : 'transparent'}` }}
            >
              <span className="text-sm font-medium" style={{ color: lang === l ? t.primary : t.fg, fontFamily: l === 'ur' ? "'Noto Nastaliq Urdu', serif" : "'Inter', sans-serif" }}>
                {l === 'en' ? 'English' : 'اردو'}
              </span>
              {lang === l && <span style={{ color: t.primary }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Theme */}
        <div className="p-4 rounded-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
          <p className="text-sm font-semibold mb-3" style={{ color: t.fg, fontFamily: uiFont(lang), textAlign: isRTL ? 'right' : 'left' }}>
            {lang === 'en' ? 'Appearance' : 'ظاہری شکل'}
          </p>
          <button
            onClick={onToggleDark}
            className={`w-full flex items-center justify-between p-3 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ background: t.surface2 }}
          >
            <span className="text-sm font-medium" style={{ color: t.fg, fontFamily: uiFont(lang) }}>
              {dark ? (lang === 'en' ? '☀️ Light Mode' : '☀️ روشن موڈ') : (lang === 'en' ? '🌙 Dark Mode' : '🌙 تاریک موڈ')}
            </span>
            <div className="w-10 h-5 rounded-full relative" style={{ background: dark ? t.primary : t.mutedBg }}>
              <div className="w-4 h-4 rounded-full absolute top-0.5 transition-all" style={{ background: '#FFF', left: dark ? '22px' : '2px' }} />
            </div>
          </button>
        </div>

        {/* About */}
        <div className="p-4 rounded-2xl text-center" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
          <p className="text-xs" style={{ color: t.muted, fontFamily: uiFont(lang), lineHeight: '2' }}>
            {lang === 'en'
              ? 'Practice Azan feature — Quran Majeed App\nAll Arabic content must be verified by a qualified Islamic scholar before production use.'
              : 'اذان پریکٹس فیچر — قرآن مجید ایپ\nتمام عربی متن کو پروڈکشن استعمال سے پہلے کسی اہل عالم سے تصدیق کرائیں۔'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN FEATURE COMPONENT ───────────────────────────────────────────────────

export default function PracticeFeature({
  t, dark, onToggleDark,
}: {
  t: T; dark: boolean; onToggleDark: () => void
}) {
  const [pScreen, setPScreen] = useState<PScreen>('home')
  const [pStack, setPStack] = useState<PScreen[]>([])
  const [lang, setLang] = useState<Lang>('en')
  const [selectedAzan, setSelectedAzan] = useState<AzanEntry>(DEMO_AZANS[1])
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['2']))
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [compareUrl, setCompareUrl] = useState<string | null>(null)
  const [sessionStart] = useState(Date.now())
  const [sessionTime, setSessionTime] = useState(0)

  const nav = useCallback((s: PScreen) => {
    setPStack(prev => [...prev, pScreen])
    setPScreen(s)
  }, [pScreen])

  const goBack = useCallback(() => {
    const prev = pStack[pStack.length - 1]
    if (prev !== undefined) { setPStack(st => st.slice(0, -1)); setPScreen(prev) }
  }, [pStack])

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSelectAzan = (azan: AzanEntry) => {
    setSelectedAzan(azan)
    setPhraseIdx(0)
    nav('preview')
  }

  const handleCompare = (url: string | null) => {
    setCompareUrl(url)
    nav('compare')
  }

  const handleFinish = () => {
    setSessionTime(Math.floor((Date.now() - sessionStart) / 1000))
    nav('completion')
  }

  const stats = { sessions: 12, phrases: 48, streak: 5 }

  const props = { lang, t }

  const render = () => {
    switch (pScreen) {
      case 'home':
        return <PracticeHome {...props} setLang={setLang} nav={nav} selectedAzan={selectedAzan} stats={stats} />
      case 'select-azan':
        return <SelectAzanScreen {...props} onBack={goBack} onSelect={handleSelectAzan} favorites={favorites} toggleFav={toggleFav} />
      case 'preview':
        return <AzanPreviewScreen {...props} onBack={goBack} azan={selectedAzan} onStartPractice={() => nav('mode-select')} />
      case 'mode-select':
        return <ModeSelectScreen {...props} onBack={goBack} onSelect={(_mode) => { setPhraseIdx(0); nav('phrase-practice') }} />
      case 'phrase-practice':
        return (
          <PhrasePracticeScreen
            {...props} onBack={goBack} azan={selectedAzan}
            phraseIdx={phraseIdx} setPhraseIdx={setPhraseIdx}
            onCompare={handleCompare} onFinish={handleFinish}
          />
        )
      case 'compare':
        return (
          <CompareScreen
            {...props} onBack={goBack} recUrl={compareUrl}
            onPracticeAgain={() => { goBack() }}
            onNextPhrase={() => {
              if (phraseIdx < selectedAzan.phrases.length - 1) {
                setPhraseIdx(phraseIdx + 1)
                goBack()
              } else {
                handleFinish()
              }
            }}
          />
        )
      case 'completion':
        return (
          <CompletionScreen
            {...props} azan={selectedAzan} sessionTime={sessionTime}
            onPracticeAgain={() => { setPhraseIdx(0); nav('phrase-practice') }}
            onProgress={() => nav('my-progress')}
          />
        )
      case 'my-progress':
        return <MyProgressScreen {...props} onBack={goBack} />
      case 'settings':
        return <SettingsScreen {...props} setLang={setLang} onBack={goBack} dark={dark} onToggleDark={onToggleDark} />
      default:
        return <PracticeHome {...props} setLang={setLang} nav={nav} selectedAzan={selectedAzan} stats={stats} />
    }
  }

  return <>{render()}</>
}
