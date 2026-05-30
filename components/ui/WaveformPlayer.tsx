'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface Props {
  src: string
  label?: string
  compact?: boolean
  onEnded?: () => void
  autoPlay?: boolean
}

const BAR_COUNT = 30

export default function WaveformPlayer({ src, label, compact = false, onEnded, autoPlay = false }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bars] = useState(() =>
    Array.from({ length: BAR_COUNT }, (_, i) => ({
      min: 0.2 + Math.random() * 0.2,
      max: 0.5 + Math.random() * 0.5,
      delay: (i / BAR_COUNT) * 2,
    }))
  )

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  const toggle = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play(); setPlaying(true) }
  }, [playing])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0)
    const onLoaded = () => setDuration(a.duration)
    const onEnd = () => { setPlaying(false); setProgress(0); onEnded?.() }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('ended', onEnd)
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onLoaded); a.removeEventListener('ended', onEnd) }
  }, [onEnded])

  useEffect(() => {
    if (autoPlay) { audioRef.current?.play().then(() => setPlaying(true)).catch(() => {}) }
  }, [autoPlay, src])

  // Keyboard: Space = play/pause (only when focused)
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ') { e.preventDefault(); toggle() }
  }, [toggle])

  const barActive = (i: number) => playing && i < progress * BAR_COUNT

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      style={{
        display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12,
        outline: 'none',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Waveform bars */}
      <div
        onClick={toggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 2,
          height: compact ? 32 : 48,
          cursor: 'pointer',
          padding: '0 2px',
        }}
      >
        {bars.map((bar, i) => {
          const active = barActive(i)
          const isPast = i / BAR_COUNT < progress
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  borderRadius: 2,
                  backgroundColor: isPast ? 'var(--accent)' : active ? 'var(--accent)' : '#2a2a2a',
                  transformOrigin: 'center',
                  transition: 'background-color 0.1s',
                  animation: playing
                    ? `breathe ${0.6 + Math.random() * 0.6}s ease-in-out ${bar.delay * 0.4}s infinite`
                    : `breathe 2.4s ease-in-out ${bar.delay}s infinite`,
                  '--min-h': bar.min,
                  '--max-h': bar.max,
                  height: `${Math.round(bar.min * 100 + (bar.max - bar.min) * 50)}%`,
                } as React.CSSProperties}
              />
            </div>
          )
        })}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={toggle}
          style={{
            width: compact ? 28 : 32, height: compact ? 28 : 32,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: '#07070c',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: compact ? 10 : 12,
            flexShrink: 0,
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Scrubber */}
        <div
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            if (audioRef.current) { audioRef.current.currentTime = ratio * audioRef.current.duration; setProgress(ratio) }
          }}
          style={{
            flex: 1, height: 3, background: 'var(--bg-4)', borderRadius: 3, cursor: 'pointer', position: 'relative',
          }}
        >
          <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.1s linear' }} />
        </div>

        <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {duration ? fmt(duration * progress) + ' / ' + fmt(duration) : '--:--'}
        </span>

        {label && !compact && (
          <span style={{ fontSize: 11, color: 'var(--text-3)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
