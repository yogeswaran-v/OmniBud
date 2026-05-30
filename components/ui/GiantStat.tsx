interface Props {
  value: string | number
  label: string
  icon?: string
  accent?: boolean
  align?: 'left' | 'center' | 'right'
}

/** Oversized hero stat number — the Crextio signature move. */
export default function GiantStat({ value, label, icon, accent = false, align = 'left' }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
      <span className="giant-num" style={{ color: accent ? 'var(--accent-strong)' : 'var(--text)' }}>
        {value}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
        {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
        {label}
      </span>
    </div>
  )
}
