interface Props {
  value: number          // 0..1
  size?: number
  stroke?: number
  centerLabel?: string   // big text in center (e.g. "84%")
  subLabel?: string      // small text under center label
  color?: string
}

/** Circular progress donut with a big number in the center — Crextio style. */
export default function Donut({ value, size = 120, stroke = 10, centerLabel, subLabel, color = 'var(--accent)' }: Props) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(Math.max(value, 0), 1) * circ
  const c = size / 2
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg-4)" strokeWidth={stroke} />
        <circle
          cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s var(--ease-out)' }}
        />
      </svg>
      {(centerLabel || subLabel) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          {centerLabel && (
            <span className="giant-num" style={{ fontSize: size * 0.26, color: 'var(--text)' }}>{centerLabel}</span>
          )}
          {subLabel && <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>{subLabel}</span>}
        </div>
      )}
    </div>
  )
}
