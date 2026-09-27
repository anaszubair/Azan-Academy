import { useState, useRef, useEffect } from 'react'
import { tx, phraseLabel, getDir, getUIFont, type Lang, type Theme, type TKey } from './locales'
import {
  AZAAN_ENTRIES, getMuazzin, getEntriesForPrayer, formatDuration,
  type AzaanEntry, type PrayerType,
} from './data/db'

// ─── THEME ───────────────────────────────────────────────────────────────────

const LIGHT = {
  bg: '#FAF7F0', fg: '#1A1A18', card: '#FFFFFF', cardFg: '#1A1A18',
  surface2: '#F2EDE3', border: '#E8E2D8', muted: '#8A8278', mutedBg: '#F5F1EA',
  primary: '#1A6645', primaryFg: '#FFFFFF', primaryLight: '#EAF4EE',
  gold: '#B8861A', goldLight: '#FDF6E3',
  red: '#C0392B', redLight: '#FDECEA',
  shadow: 'rgba(0,0,0,0.08)',
}
const DARK = {
  bg: '#0D1117', fg: '#F0EDE8', card: '#151E2D', cardFg: '#EDE9E0',
  surface2: '#1A2535', border: '#2A3345', muted: '#8899AA', mutedBg: '#1A2535',
  primary: '#2A9E6B', primaryFg: '#FFFFFF', primaryLight: '#0D2B1E',
  gold: '#D4A832', goldLight: '#231A08',
  red: '#E74C3C', redLight: '#2B0F0D',
  shadow: 'rgba(0,0,0,0.35)',
}

function mk(dark: boolean) { return dark ? DARK : LIGHT }
type C = typeof LIGHT

// ─── SETTINGS ────────────────────────────────────────────────────────────────

type Screen = 'main' | 'detail' | 'practice' | 'completion' | 'settings'
type Category = 'ALL' | PrayerType

interface Settings {
  lang: Lang
  theme: Theme
  notifications: boolean
  autoPlayRef: boolean
}

const DEFAULT_SETTINGS: Settings = { lang: 'en', theme: 'system', notifications: false, autoPlayRef: false }

function loadSettings(): Settings {
  try {
    const s = localStorage.getItem('az_v1_settings')
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS
}

function resolveDark(theme: Theme): boolean {
  if (theme === 'light') return false
  if (theme === 'dark') return true
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ─── SMALL SHARED COMPONENTS ──────────────────────────────────────────────────

function Divider({ c }: { c: C }) {
  return <div style={{ height: 1, background: c.border }} />
}

function Badge({ label, c, gold }: { label: string; c: C; gold?: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 11px', borderRadius: 99,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      background: gold ? c.goldLight : c.primaryLight,
      color: gold ? c.gold : c.primary,
    }}>
      {label}
    </span>
  )
}

function BackBtn({ onBack, isRTL }: { onBack: () => void; isRTL: boolean }) {
  return (
    <button
      onClick={onBack}
      style={{
        width: 36, height: 36, borderRadius: 18, border: 'none', cursor: 'pointer',
        background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(8px)',
        color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-label="Back"
    >
      {isRTL ? '→' : '←'}
    </button>
  )
}

function PrimaryBtn({ label, onClick, c, disabled, outline }: {
  label: string; onClick: () => void; c: C; disabled?: boolean; outline?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '14px 24px', borderRadius: 14, cursor: disabled ? 'default' : 'pointer',
        fontWeight: 700, fontSize: 16, letterSpacing: '0.02em',
        border: outline ? `2px solid ${c.primary}` : 'none',
        background: outline ? 'transparent' : (disabled ? c.border : c.primary),
        color: outline ? c.primary : c.primaryFg,
        opacity: disabled ? 0.55 : 1, transition: 'opacity 0.2s',
      }}
    >
      {label}
    </button>
  )
}

function GhostBtn({ label, onClick, c }: { label: string; onClick: () => void; c: C }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px 24px', borderRadius: 14, cursor: 'pointer',
        fontWeight: 600, fontSize: 15, border: `1px solid ${c.border}`,
        background: 'transparent', color: c.fg,
      }}
    >
      {label}
    </button>
  )
}

// ─── GEOMETRIC PATTERN ───────────────────────────────────────────────────────

function GeometricPattern({ color, opacity = 0.06 }: { color: string; opacity?: number }) {
  return (
    <svg
      width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="gp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <polygon points="20,2 38,20 20,38 2,20" fill="none" stroke={color} strokeWidth="1" />
          <circle cx="20" cy="20" r="4" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="20" y1="2" x2="20" y2="38" stroke={color} strokeWidth="0.4" />
          <line x1="2" y1="20" x2="38" y2="20" stroke={color} strokeWidth="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gp)" />
    </svg>
  )
}

// ─── WAVEFORM ────────────────────────────────────────────────────────────────

function Waveform({ active, color }: { active: boolean; color: string }) {
  const BARS = [14, 22, 30, 18, 26, 10, 20, 28, 16, 24]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {BARS.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 3, background: color,
            height: active ? h : 4,
            transition: active ? 'none' : 'height 0.3s',
            animation: active
              ? `waveBar 0.${5 + (i % 4)}s ease-in-out ${i * 0.07}s infinite alternate`
              : 'none',
            ['--wave-h' as string]: `${h}px`,
          }}
        />
      ))}
    </div>
  )
}

// ─── AUDIO PLAYER (simulated) ─────────────────────────────────────────────────

function AudioPlayer({ durationSec, c, t }: { durationSec: number; c: C; t: (k: TKey) => string }) {
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const iRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (playing) {
      iRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= durationSec) {
            clearInterval(iRef.current!)
            setPlaying(false)
            return durationSec
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (iRef.current) clearInterval(iRef.current)
    }
    return () => { if (iRef.current) clearInterval(iRef.current) }
  }, [playing, durationSec])

  function toggle() {
    if (elapsed >= durationSec) setElapsed(0)
    setPlaying(p => !p)
  }

  const progress = durationSec > 0 ? elapsed / durationSec : 0

  return (
    <div style={{ background: c.surface2, borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={toggle}
          style={{
            width: 48, height: 48, borderRadius: 24, border: 'none', cursor: 'pointer',
            background: c.primary, color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 4, borderRadius: 4, background: c.border, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: c.primary, width: `${progress * 100}%`, transition: 'width 0.8s linear' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: c.muted }}>{formatDuration(elapsed)}</span>
            <span style={{ fontSize: 12, color: c.muted }}>{formatDuration(durationSec)}</span>
          </div>
        </div>
        <Waveform active={playing} color={c.primary} />
      </div>
      {elapsed >= durationSec && elapsed > 0 && (
        <button
          onClick={() => { setElapsed(0); setPlaying(false) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.primary, fontSize: 13, fontWeight: 600, textAlign: 'center' }}
        >
          {t('replay')}
        </button>
      )}
    </div>
  )
}

// ─── REFERENCE LISTEN (compact) ───────────────────────────────────────────────

function ReferenceListen({ c, onDone }: { c: C; onDone: () => void }) {
  const [state, setState] = useState<'idle' | 'playing' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const iRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const DURATION = 2800

  function play() {
    if (state === 'playing') return
    setState('playing')
    setProgress(0)
    const start = Date.now()
    iRef.current = setInterval(() => {
      const p = Math.min((Date.now() - start) / DURATION, 1)
      setProgress(p)
      if (p >= 1) {
        clearInterval(iRef.current!)
        setState('done')
        onDone()
      }
    }, 40)
  }

  useEffect(() => () => { if (iRef.current) clearInterval(iRef.current) }, [])

  return (
    <div style={{ background: c.primaryLight, borderRadius: 14, padding: '14px 16px' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: c.primary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Reference
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={play}
          style={{
            width: 40, height: 40, borderRadius: 20, border: 'none', cursor: 'pointer',
            background: c.primary, color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          {state === 'playing' ? '⏸' : '▶'}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.primary, marginBottom: 6 }}>
            {state === 'idle' ? 'Listen & Practice' : state === 'playing' ? 'Playing…' : '✓ Done — Replay anytime'}
          </div>
          <div style={{ height: 3, borderRadius: 3, background: `${c.primary}33`, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, background: c.primary, width: `${progress * 100}%`, transition: 'width 0.05s linear' }} />
          </div>
        </div>
        {state === 'playing' && <Waveform active color={c.primary} />}
      </div>
    </div>
  )
}

// ─── PRACTICE SECTION (record + counter + history) ────────────────────────────

interface HistoryItem { url: string | null; durationSec: number; index: number }

const PRACTICE_TARGET = 10

function PracticeSection({ c, onFirstRecorded }: { c: C; onFirstRecorded: () => void }) {
  const [step, setStep] = useState<'idle' | 'recording' | 'done'>('idle')
  const [micDenied, setMicDenied] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [practiceCount, setPracticeCount] = useState(0)
  const [latestUrl, setLatestUrl] = useState<string | null>(null)
  const [latestDuration, setLatestDuration] = useState(0)
  const [playingLatest, setPlayingLatest] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [targetReached, setTargetReached] = useState(false)

  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const iRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestAudioRef = useRef<HTMLAudioElement | null>(null)
  const historyAudioRefs = useRef<Record<number, HTMLAudioElement>>({})

  async function startRecording() {
    chunksRef.current = []
    setElapsed(0)
    setStep('recording')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      recRef.current = rec
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        stream.getTracks().forEach(tr => tr.stop())
        finishRecording(url)
      }
      rec.start()
    } catch {
      setMicDenied(true)
      setTimeout(() => finishRecording(null), 3500)
    }
    iRef.current = setInterval(() => setElapsed(p => p + 1), 1000)
  }

  function finishRecording(url: string | null) {
    if (iRef.current) clearInterval(iRef.current)
    const dur = elapsed
    setLatestUrl(url)
    setLatestDuration(dur)
    setLatestAudioIfNeeded(url)
    const newCount = practiceCount + 1
    setPracticeCount(newCount)
    setHistory(prev => [{ url, durationSec: dur, index: newCount }, ...prev.slice(0, 4)])
    setStep('done')
    if (newCount === 1) onFirstRecorded()
    if (newCount >= PRACTICE_TARGET && !targetReached) setTargetReached(true)
  }

  function setLatestAudioIfNeeded(url: string | null) {
    if (!url) return
    latestAudioRef.current = new Audio(url)
    latestAudioRef.current.onended = () => setPlayingLatest(false)
  }

  function stopRecording() {
    if (recRef.current && recRef.current.state !== 'inactive') {
      recRef.current.stop()
    } else {
      finishRecording(null)
    }
  }

  function playLatest() {
    if (!latestUrl || !latestAudioRef.current) return
    latestAudioRef.current.currentTime = 0
    latestAudioRef.current.play()
    setPlayingLatest(true)
  }

  function playHistory(item: HistoryItem) {
    if (!item.url) return
    if (!historyAudioRefs.current[item.index]) {
      historyAudioRefs.current[item.index] = new Audio(item.url)
    }
    historyAudioRefs.current[item.index].currentTime = 0
    historyAudioRefs.current[item.index].play()
  }

  function recordAgain() { setStep('idle'); setLatestUrl(null); setElapsed(0); setPlayingLatest(false) }

  useEffect(() => () => { if (iRef.current) clearInterval(iRef.current) }, [])

  // SVG progress ring for Tasbeeh counter
  const R = 52
  const CIRC = 2 * Math.PI * R
  const ringProgress = Math.min(practiceCount / PRACTICE_TARGET, 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── LARGE RED RECORD BUTTON ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '8px 0' }}>
        {step !== 'recording' && (
          <button
            onClick={startRecording}
            style={{
              width: 88, height: 88, borderRadius: 44, border: 'none', cursor: 'pointer',
              background: c.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 10px ${c.red}22, 0 4px 20px ${c.red}55`,
              transition: 'transform 0.12s',
            }}
            aria-label="Record"
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <rect x="13" y="4" width="10" height="17" rx="5" fill="white" />
              <path d="M7 17c0 6.075 4.925 11 11 11s11-4.925 11-11" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <line x1="18" y1="28" x2="18" y2="33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="33" x2="24" y2="33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {step === 'idle' && (
          <p style={{ margin: 0, fontSize: 13, color: c.muted, fontWeight: 600 }}>Tap to Record</p>
        )}

        {step === 'recording' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 88, height: 88, borderRadius: 44,
              background: c.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'recordPulse 1s ease-in-out infinite',
              boxShadow: `0 0 0 10px ${c.red}33`,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: 4, background: '#fff' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.red }}>🔴 Recording</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: c.fg, fontVariantNumeric: 'tabular-nums' }}>
                {formatDuration(elapsed)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              style={{
                padding: '9px 28px', borderRadius: 10, border: `1.5px solid ${c.border}`,
                background: 'transparent', color: c.fg, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Tap to Stop
            </button>
          </div>
        )}

        {micDenied && step === 'idle' && (
          <p style={{ margin: 0, fontSize: 12, color: c.red, textAlign: 'center', maxWidth: 240 }}>
            Microphone permission required. Please allow access and try again.
          </p>
        )}
      </div>

      {/* ── MY RECORDING ── */}
      {step === 'done' && (
        <div style={{ background: c.surface2, borderRadius: 14, padding: '14px 16px' }} className="anim-fade-in">
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            My Recording
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={playLatest}
              style={{
                width: 44, height: 44, borderRadius: 22, border: 'none', cursor: 'pointer',
                background: playingLatest ? c.primary : c.card,
                color: playingLatest ? '#fff' : c.primary,
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: `0 1px 6px ${c.shadow}`,
              }}
              aria-label="Play My Recording"
            >
              {playingLatest ? '⏸' : '▶'}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 3, background: c.border }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontSize: 11, color: c.muted }}>{formatDuration(latestDuration)}</span>
                <span style={{ fontSize: 11, color: c.muted }}>Practice {practiceCount}</span>
              </div>
            </div>
            <button
              onClick={recordAgain}
              style={{
                padding: '8px 14px', borderRadius: 8, border: `1px solid ${c.border}`,
                background: 'transparent', color: c.muted, cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0,
              }}
            >
              🎙 Again
            </button>
          </div>
          {playingLatest && (
            <div style={{ marginTop: 10 }}>
              <Waveform active color={c.primary} />
            </div>
          )}
        </div>
      )}

      {/* ── TASBEEH-STYLE PRACTICE COUNTER ── */}
      {practiceCount > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '10px 0' }} className="anim-fade-in">
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Practice Count
          </p>
          <div style={{ position: 'relative', width: 124, height: 124 }}>
            <svg width="124" height="124" viewBox="0 0 124 124" aria-hidden="true">
              {/* Track */}
              <circle cx="62" cy="62" r={R} fill="none" stroke={c.border} strokeWidth="6" />
              {/* Progress */}
              <circle
                cx="62" cy="62" r={R} fill="none"
                stroke={targetReached ? c.gold : c.primary} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - ringProgress)}
                transform="rotate(-90 62 62)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: targetReached ? c.gold : c.fg, lineHeight: 1 }}>
                {practiceCount}
              </span>
              <span style={{ fontSize: 11, color: c.muted, fontWeight: 600 }}>/ {PRACTICE_TARGET}</span>
            </div>
          </div>
          {targetReached ? (
            <p style={{ margin: 0, fontSize: 13, color: c.gold, fontWeight: 600, textAlign: 'center', maxWidth: 260 }}>
              ✓ Practice target reached — keep going to build confidence!
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: c.muted }}>
              {PRACTICE_TARGET - practiceCount} more to reach target
            </p>
          )}
        </div>
      )}

      {/* ── RECENT RECORDINGS ── */}
      {history.length > 1 && (
        <div style={{ background: c.surface2, borderRadius: 14, padding: '12px 14px' }} className="anim-fade-in">
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Recent Recordings
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {history.slice(1).map((item, idx) => (
              <div key={item.index}>
                {idx > 0 && <div style={{ height: 1, background: c.border, margin: '6px 0' }} />}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: c.fg, fontWeight: 500 }}>Practice {item.index}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: c.muted }}>{formatDuration(item.durationSec)}</span>
                    {item.url && (
                      <button
                        onClick={() => playHistory(item)}
                        style={{
                          width: 28, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                          background: c.primaryLight, color: c.primary, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        aria-label={`Play practice ${item.index}`}
                      >
                        ▶
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SCREEN: MAIN ─────────────────────────────────────────────────────────────

function MainScreen({ c, t, lang, isRTL, onSelectEntry, onOpenSettings }: {
  c: C; t: (k: TKey) => string; lang: Lang; isRTL: boolean;
  onSelectEntry: (e: AzaanEntry) => void;
  onOpenSettings: () => void;
}) {
  const [tab, setTab] = useState<'ALL' | 'Fajr'>('ALL')
  const [introExpanded, setIntroExpanded] = useState(false)

  const entries = tab === 'Fajr' ? getEntriesForPrayer('Fajr') : getEntriesForPrayer('ALL')

  return (
    <div
      style={{ height: '100%', overflowY: 'auto', background: c.bg, fontFamily: getUIFont(lang) }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="hide-scrollbar"
    >
      {/* HERO HEADER */}
      <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${c.primary} 0%, #0F4A30 100%)` }}>
        <GeometricPattern color="#fff" opacity={0.07} />
        <div style={{ position: 'relative', zIndex: 1, padding: '52px 20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
              {t('appName')}
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
              {t('appSubtitle')}
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            style={{
              width: 40, height: 40, borderRadius: 20, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            aria-label="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* WHAT IS AZAAN */}
        <div style={{ background: c.card, borderRadius: 16, overflow: 'hidden', boxShadow: `0 2px 12px ${c.shadow}`, border: `1px solid ${c.border}` }}>
          <button
            onClick={() => setIntroExpanded(e => !e)}
            style={{
              width: '100%', padding: '16px 18px', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              textAlign: isRTL ? 'right' : 'left',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: c.fg }}>{t('whatIsAzaan')}</span>
            <span style={{ color: c.primary, fontSize: 18, transform: introExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 8 }}>▾</span>
          </button>
          {introExpanded && (
            <div style={{ padding: '0 18px 18px' }} className="anim-fade-in">
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: c.fg }}>{t('azaanIntroFull')}</p>
            </div>
          )}
        </div>

        {/* HADITH CARD */}
        <div style={{ background: c.goldLight, borderRadius: 16, padding: '18px', border: `1px solid ${c.gold}44`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -16, right: -12, fontSize: 80, opacity: 0.07, fontFamily: "'Amiri', serif", lineHeight: 1, pointerEvents: 'none' }}>❝</div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: c.gold, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('virtue')}</p>
          <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.8, color: c.fg, fontStyle: 'italic' }}>{t('hadithText')}</p>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: c.gold, fontWeight: 600 }}>{t('hadithSource')}</p>
          <p style={{ margin: 0, fontSize: 10, color: c.muted }}>{t('hadithNote')}</p>
        </div>

        {/* SELECT AZAAN HEADING */}
        <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: c.fg }}>{t('selectAzaan')}</h2>

        {/* SEGMENTED SELECTOR */}
        <div style={{
          display: 'flex', background: c.surface2, borderRadius: 14, padding: 4,
          border: `1px solid ${c.border}`,
        }}>
          {(['ALL', 'Fajr'] as const).map((key) => {
            const display = key === 'ALL'
              ? (lang === 'ur' ? 'تمام اذانیں' : lang === 'ar' ? 'جميع الأذانات' : 'All Azaans')
              : (lang === 'ur' ? 'فجر اذان' : lang === 'ar' ? 'أذان الفجر' : 'Fajr Azaan')
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 11, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 14, transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                  background: active ? c.primary : 'transparent',
                  color: active ? '#fff' : c.muted,
                  boxShadow: active ? `0 2px 8px ${c.primary}55` : 'none',
                  fontFamily: getUIFont(lang),
                }}
              >
                {display}
              </button>
            )
          })}
        </div>

        {/* AZAAN CARDS */}
        {entries.length === 0 ? (
          <p style={{ textAlign: 'center', color: c.muted, fontSize: 14, padding: '24px 0' }}>{t('noAzaans')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map(entry => {
              const muazzin = getMuazzin(entry.muazzinId)
              if (!muazzin) return null
              const name = lang === 'ur' ? muazzin.nameUr : lang === 'ar' ? muazzin.nameAr : muazzin.nameEn
              const mosque = lang === 'ur' ? muazzin.mosqueUr : muazzin.mosqueEn
              const city = lang === 'ur' ? muazzin.cityUr : muazzin.cityEn
              return (
                <button
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  style={{
                    display: 'flex', gap: 14, padding: '14px', borderRadius: 14, textAlign: isRTL ? 'right' : 'left',
                    background: c.card, border: `1px solid ${c.border}`, cursor: 'pointer',
                    boxShadow: `0 1px 8px ${c.shadow}`, alignItems: 'center',
                  }}
                >
                  <img
                    src={muazzin.imageUrl}
                    alt={city}
                    style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                    loading="lazy"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 14, color: c.fg, lineHeight: 1.3 }}>{name}</p>
                    <p style={{ margin: '0 0 8px', fontSize: 12, color: c.muted }}>{mosque} · {city}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge label={entry.prayerType} c={c} />
                      <Badge label={`⏱ ${formatDuration(entry.durationSec)}`} c={c} gold />
                    </div>
                  </div>
                  <span style={{ fontSize: 20, color: c.muted, flexShrink: 0 }}>{isRTL ? '‹' : '›'}</span>
                </button>
              )
            })}
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}

// ─── SCREEN: MUAZZIN DETAIL ───────────────────────────────────────────────────

function MuazzinDetailScreen({ entry, c, t, lang, isRTL, onBack, onStartPractice }: {
  entry: AzaanEntry; c: C; t: (k: TKey) => string; lang: Lang; isRTL: boolean;
  onBack: () => void; onStartPractice: () => void;
}) {
  const muazzin = getMuazzin(entry.muazzinId)!
  const [bioExpanded, setBioExpanded] = useState(false)

  const name   = lang === 'ur' ? muazzin.nameUr   : lang === 'ar' ? muazzin.nameAr   : muazzin.nameEn
  const mosque = lang === 'ur' ? muazzin.mosqueUr  : muazzin.mosqueEn
  const city   = lang === 'ur' ? muazzin.cityUr    : muazzin.cityEn
  const country= lang === 'ur' ? muazzin.countryUr : muazzin.countryEn
  const bio    = lang === 'ur' ? muazzin.bioUr     : muazzin.bioEn

  const heroUrl = muazzin.imageUrl.replace('w=480&h=300', 'w=600&h=440')

  return (
    <div
      style={{ height: '100%', overflowY: 'auto', background: c.bg, fontFamily: getUIFont(lang) }}
      dir={isRTL ? 'rtl' : 'ltr'}
      className="hide-scrollbar"
    >
      {/* HERO */}
      <div style={{ position: 'relative', height: 230, flexShrink: 0 }}>
        <img src={heroUrl} alt={city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', top: 48, left: isRTL ? 'auto' : 16, right: isRTL ? 16 : 'auto' }}>
          <BackBtn onBack={onBack} isRTL={isRTL} />
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: isRTL ? 'auto' : 16, right: isRTL ? 16 : 'auto' }}>
          <Badge label={entry.prayerType} c={c} />
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: c.fg, lineHeight: 1.2 }}>{name}</h1>
          <p style={{ margin: '0 0 4px', fontSize: 14, color: c.muted }}>{mosque}</p>
          <p style={{ margin: 0, fontSize: 13, color: c.muted }}>{city}, {country} &nbsp;·&nbsp; ⏱ {formatDuration(entry.durationSec)}</p>
        </div>

        <Divider c={c} />

        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: c.fg }}>{t('aboutMuazzin')}</h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: c.fg }}>
            {bioExpanded ? bio : bio.slice(0, 140) + (bio.length > 140 ? '…' : '')}
          </p>
          {bio.length > 140 && (
            <button
              onClick={() => setBioExpanded(e => !e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.primary, fontSize: 13, fontWeight: 600, padding: '6px 0 0' }}
            >
              {bioExpanded ? t('readLess') : t('readMore')}
            </button>
          )}
        </div>

        <Divider c={c} />

        <div>
          <h2 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: c.fg }}>{t('listenAzaan')}</h2>
          <AudioPlayer durationSec={entry.durationSec} c={c} t={t} />
        </div>

        <div style={{ paddingBottom: 16 }}>
          <PrimaryBtn label={t('startPractice')} onClick={onStartPractice} c={c} />
        </div>
      </div>
    </div>
  )
}

// ─── SCREEN: PRACTICE ─────────────────────────────────────────────────────────

function PracticeScreen({ entry, c, t, lang, isRTL, onBack, onComplete }: {
  entry: AzaanEntry; c: C; t: (k: TKey) => string; lang: Lang; isRTL: boolean;
  onBack: () => void; onComplete: () => void;
}) {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [refDone, setRefDone] = useState(false)
  const [everRecorded, setEverRecorded] = useState(false)
  const [subKey, setSubKey] = useState(0)

  const phrases = entry.phrases
  const phrase = phrases[phraseIdx]
  const total = phrases.length
  const isLast = phraseIdx === total - 1

  function nextPhrase() {
    if (isLast) { onComplete(); return }
    setPhraseIdx(i => i + 1)
    setRefDone(false)
    setEverRecorded(false)
    setSubKey(k => k + 1)
  }

  function practiceAgain() {
    setRefDone(false)
    setEverRecorded(false)
    setSubKey(k => k + 1)
  }

  const transLine = lang === 'ur' ? phrase.transUr : lang === 'ar' ? phrase.transAr : phrase.transEn

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: c.bg, fontFamily: getUIFont(lang) }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* HEADER */}
      <div style={{ padding: '48px 16px 14px', background: c.card, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <BackBtn onBack={onBack} isRTL={isRTL} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 12, color: c.muted, fontWeight: 600 }}>{phraseLabel(lang, phraseIdx + 1, total)}</p>
          <div style={{ height: 4, background: c.surface2, borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, background: c.primary, width: `${((phraseIdx + 1) / total) * 100}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
      </div>

      {/* SCROLL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18 }} className="hide-scrollbar">

        {/* PHRASE CARD */}
        <div style={{ background: c.card, borderRadius: 18, padding: '26px 20px', boxShadow: `0 2px 14px ${c.shadow}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }} className="anim-fade-in">
          <GeometricPattern color={c.primary} opacity={0.04} />
          <p dir="rtl" style={{ margin: '0 0 14px', fontSize: 28, lineHeight: 1.75, fontFamily: "'Amiri', serif", color: c.fg, fontWeight: 700, position: 'relative', zIndex: 1 }}>
            {phrase.arabic}
          </p>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: c.muted, fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
            {phrase.transliteration}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: c.fg, fontWeight: 500, position: 'relative', zIndex: 1 }}>
            {transLine}
          </p>
        </div>

        {/* STEP 1 — REFERENCE */}
        <ReferenceListen key={`ref-${subKey}`} c={c} onDone={() => setRefDone(true)} />

        {/* STEP 2 — RECORD + COUNTER + HISTORY (unlocks after reference played) */}
        {refDone && (
          <div className="anim-fade-in">
            <PracticeSection
              key={`ps-${subKey}`}
              c={c}
              onFirstRecorded={() => setEverRecorded(true)}
            />
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>

      {/* FOOTER — Practice Again (primary) + Next Phrase / Finish (secondary) */}
      {everRecorded && (
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${c.border}`, background: c.card, display: 'flex', flexDirection: 'column', gap: 8 }} className="anim-fade-in">
          <PrimaryBtn label="Practice Again" onClick={practiceAgain} c={c} />
          <GhostBtn label={isLast ? t('finish') : t('nextPhrase')} onClick={nextPhrase} c={c} />
        </div>
      )}
    </div>
  )
}

// ─── SCREEN: COMPLETION ───────────────────────────────────────────────────────

function CompletionScreen({ entry, c, t, lang, isRTL, onPracticeAgain, onDone }: {
  entry: AzaanEntry; c: C; t: (k: TKey) => string; lang: Lang; isRTL: boolean;
  onPracticeAgain: () => void; onDone: () => void;
}) {
  const muazzin = getMuazzin(entry.muazzinId)
  const mosque = muazzin ? (lang === 'ur' ? muazzin.mosqueUr : muazzin.mosqueEn) : ''

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: c.bg, fontFamily: getUIFont(lang), padding: '40px 24px', textAlign: 'center' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div style={{ width: 96, height: 96, borderRadius: 48, background: c.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, boxShadow: `0 0 0 14px ${c.primaryLight}66` }}>
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="26" cy="26" r="26" fill={c.primary} />
          <polyline points="14,27 22,35 38,18" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 800, color: c.fg, lineHeight: 1.2 }}>{t('practiceComplete')}</h1>
      <p style={{ margin: '0 0 20px', fontSize: 15, color: c.fg, lineHeight: 1.7 }}>{t('wellDone')}</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Badge label={entry.prayerType} c={c} />
        {mosque && <Badge label={mosque} c={c} gold />}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <PrimaryBtn label={t('practiceAgain')} onClick={onPracticeAgain} c={c} />
        <GhostBtn label={t('done')} onClick={onDone} c={c} />
      </div>
    </div>
  )
}

// ─── SCREEN: SETTINGS ─────────────────────────────────────────────────────────

function SettingsScreen({ settings, c, t, lang, isRTL, onBack, onSave }: {
  settings: Settings; c: C; t: (k: TKey) => string; lang: Lang; isRTL: boolean;
  onBack: () => void; onSave: (s: Settings) => void;
}) {
  const [s, setS] = useState<Settings>(settings)
  function update(patch: Partial<Settings>) { const next = { ...s, ...patch }; setS(next); onSave(next) }

  const LANGS: { key: Lang; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'ur', label: 'اردو'    },
    { key: 'ar', label: 'العربية' },
  ]
  const THEMES: { key: Theme; label: TKey }[] = [
    { key: 'light',  label: 'lightMode'     },
    { key: 'dark',   label: 'darkMode'      },
    { key: 'system', label: 'systemDefault' },
  ]

  function PillGroup<K extends string>({ opts, value, onChange }: { opts: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {opts.map(o => (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            style={{
              padding: '8px 18px', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14,
              background: value === o.key ? c.primary : c.surface2,
              color: value === o.key ? '#fff' : c.fg,
              transition: 'background 0.15s',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    )
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!value)}
        style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: value ? c.primary : c.border, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
        role="switch"
        aria-checked={value}
      >
        <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 3, left: value ? 25 : 3, transition: 'left 0.2s' }} />
      </button>
    )
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: c.muted, textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: isRTL ? 0 : 4, paddingRight: isRTL ? 4 : 0 }}>{title}</p>
        <div style={{ background: c.card, borderRadius: 14, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    )
  }

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <span style={{ fontSize: 15, color: c.fg, fontWeight: 500 }}>{label}</span>
        {children}
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: c.bg, fontFamily: getUIFont(lang) }} dir={isRTL ? 'rtl' : 'ltr'} className="hide-scrollbar">
      <div style={{ padding: '48px 16px 14px', background: c.card, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        <BackBtn onBack={onBack} isRTL={isRTL} />
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: c.fg }}>{t('settings')}</h1>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <Section title={t('language')}>
          <div style={{ padding: '16px 18px' }}>
            <PillGroup opts={LANGS} value={s.lang} onChange={(k) => update({ lang: k })} />
          </div>
        </Section>

        <Section title={t('appearance')}>
          <div style={{ padding: '16px 18px' }}>
            <PillGroup
              opts={THEMES.map(th => ({ key: th.key, label: t(th.label) }))}
              value={s.theme}
              onChange={(k) => update({ theme: k })}
            />
          </div>
        </Section>

        <Section title={t('notifications')}>
          <Row label={t('enableNotifications')}>
            <Toggle value={s.notifications} onChange={(v) => update({ notifications: v })} />
          </Row>
        </Section>

        <Section title={t('audioSettings')}>
          <Row label={t('autoPlayRef')}>
            <Toggle value={s.autoPlayRef} onChange={(v) => update({ autoPlayRef: v })} />
          </Row>
        </Section>

        <Section title={t('about')}>
          <div style={{ padding: '16px 18px' }}>
            <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: c.fg }}>{t('appName')}</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: c.muted }}>{t('version')}</p>
            <p style={{ margin: 0, fontSize: 12, color: c.muted, lineHeight: 1.7 }}>{t('hadithNote')}</p>
          </div>
        </Section>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [screen, setScreen] = useState<Screen>('main')
  const [stack, setStack] = useState<Screen[]>([])
  const [selectedEntry, setSelectedEntry] = useState<AzaanEntry | null>(null)
  const [practiceKey, setPracticeKey] = useState(0)

  const { lang, theme } = settings
  const dark = resolveDark(theme)
  const c = mk(dark)
  const isRTL = getDir(lang) === 'rtl'

  function t(key: TKey) { return tx(lang, key) }

  function navigate(s: Screen) {
    setStack(prev => [...prev, screen])
    setScreen(s)
  }

  function goBack() {
    setStack(prev => {
      const next = prev[prev.length - 1]
      if (next !== undefined) setScreen(next)
      return prev.slice(0, -1)
    })
  }

  function goMain() { setStack([]); setScreen('main') }

  function saveSettings(s: Settings) {
    setSettings(s)
    try { localStorage.setItem('az_v1_settings', JSON.stringify(s)) } catch { /* ignore */ }
  }

  const entry = selectedEntry ?? AZAAN_ENTRIES[0]

  return (
    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', background: dark ? '#070B10' : '#DDD6C8' }}>
      <div style={{ width: '100%', maxWidth: 430, height: '100%', position: 'relative', background: c.bg, overflow: 'hidden', boxShadow: '0 0 60px rgba(0,0,0,0.25)' }}>

        {screen === 'main' && (
          <MainScreen
            c={c} t={t} lang={lang} isRTL={isRTL}
            onSelectEntry={(e) => { setSelectedEntry(e); navigate('detail') }}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {screen === 'detail' && (
          <MuazzinDetailScreen
            entry={entry} c={c} t={t} lang={lang} isRTL={isRTL}
            onBack={goBack}
            onStartPractice={() => { setPracticeKey(k => k + 1); navigate('practice') }}
          />
        )}

        {screen === 'practice' && (
          <PracticeScreen
            key={practiceKey}
            entry={entry} c={c} t={t} lang={lang} isRTL={isRTL}
            onBack={goBack}
            onComplete={() => navigate('completion')}
          />
        )}

        {screen === 'completion' && (
          <CompletionScreen
            entry={entry} c={c} t={t} lang={lang} isRTL={isRTL}
            onPracticeAgain={() => { setPracticeKey(k => k + 1); setStack([]); setScreen('practice') }}
            onDone={goMain}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen
            settings={settings} c={c} t={t} lang={lang} isRTL={isRTL}
            onBack={goBack}
            onSave={saveSettings}
          />
        )}
      </div>
    </div>
  )
}
