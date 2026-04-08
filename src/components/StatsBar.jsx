import React from 'react'
import { estimateFalsePositiveRate } from '../utils/hashes'

export default function StatsBar({ bits, insertedItems, size, k }) {
  const setBits = bits.filter(Boolean).length
  const fp = estimateFalsePositiveRate(insertedItems.length, size, k)
  const fillPct = Math.round((setBits / size) * 100)

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
    }}>
      {/* Fill bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          <span>Array saturation</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{setBits}/{size} bits</span>
        </div>
        <div style={{
          height: 6,
          borderRadius: 3,
          background: 'var(--bg-raised)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: `${fillPct}%`,
            borderRadius: 3,
            background: fillPct > 80
              ? 'var(--h4)'
              : fillPct > 50
                ? 'var(--h3)'
                : 'var(--h1)',
            transition: 'width 0.4s ease, background 0.4s ease',
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {[
          { label: 'Items inserted', val: insertedItems.length, mono: true },
          { label: 'Bits set', val: `${setBits}`, mono: true },
          { label: 'Saturation', val: `${fillPct}%`, mono: true },
          { label: 'Est. FP rate', val: `${(fp * 100).toFixed(2)}%`, mono: true, color: fp > 0.1 ? 'var(--h4)' : fp > 0.01 ? 'var(--h3)' : 'var(--h2)' },
        ].map((s, i, arr) => (
          <div key={s.label} style={{
            flex: 1,
            textAlign: 'center',
            borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            padding: '0 8px',
          }}>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: s.mono ? 'var(--font-mono)' : 'inherit',
              color: s.color || 'var(--text-primary)',
              lineHeight: 1.2,
            }}>
              {s.val}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
