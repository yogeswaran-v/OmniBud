'use client'
import { useEffect, useState } from 'react'

interface Props { trigger: boolean; x?: number; y?: number }

export default function ParticleBurst({ trigger, x = 50, y = 50 }: Props) {
  const [particles, setParticles] = useState<{ id: number; tx: string; color: string; size: number; delay: number }[]>([])

  useEffect(() => {
    if (!trigger) return
    const colors = ['#f97316', '#a78bfa', '#f97316', '#a8d530', '#9b85ff', '#f97316']
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      tx: `${(Math.random() - 0.5) * 80}px`,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 5,
      delay: Math.random() * 0.2,
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 900)
  }, [trigger])

  if (!particles.length) return null

  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, pointerEvents: 'none', zIndex: 100 }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: p.color,
            '--tx': p.tx,
            animation: `particleUp 0.7s ease-out ${p.delay}s forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
