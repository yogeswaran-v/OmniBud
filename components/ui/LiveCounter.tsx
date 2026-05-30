'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  target: number
  durationMs?: number
  drift?: boolean   // keep ticking up slowly after reaching target (alive feel)
  style?: React.CSSProperties
}

/** Counts up to target on mount, then optionally drifts upward to feel live. */
export default function LiveCounter({ target, durationMs = 1400, drift = true, style }: Props) {
  const [n, setN] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setN(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  useEffect(() => {
    if (!drift) return
    const id = setInterval(() => setN(prev => prev + Math.floor(Math.random() * 3) + 1), 4200)
    return () => clearInterval(id)
  }, [drift])

  return <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{n.toLocaleString()}</span>
}
