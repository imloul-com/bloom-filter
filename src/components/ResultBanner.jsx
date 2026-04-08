import React from 'react'

const CONFIGS = {
  found: {
    icon: '✓',
    color: 'var(--h2)',
    bg: 'var(--h2-bg)',
    border: 'var(--h2-border)',
    title: (w) => `"${w}" — definitely in the set`,
    sub: 'All bits set. This item was previously inserted.',
  },
  'false-positive': {
    icon: '⚠',
    color: 'var(--h3)',
    bg: 'var(--h3-bg)',
    border: 'var(--h3-border)',
    title: (w) => `"${w}" — false positive`,
    sub: 'All bits are set, but this item was never inserted. Collision from other items.',
  },
  'not-found': {
    icon: '✗',
    color: 'var(--h4)',
    bg: 'var(--h4-bg)',
    border: 'var(--h4-border)',
    title: (w) => `"${w}" — definitely not in the set`,
    sub: 'At least one bit is 0. Bloom filters have zero false negatives.',
  },
}

export default function ResultBanner({ result, word }) {
  if (!result || !word) return null
  const cfg = CONFIGS[result]
  if (!cfg) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 'var(--radius-lg)',
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      animation: 'resultIn 0.35s cubic-bezier(0.34,1.4,0.64,1)',
    }}>
      <style>{`
        @keyframes resultIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <span style={{ fontSize: 22, lineHeight: 1.2, color: cfg.color }}>{cfg.icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: cfg.color }}>
          {cfg.title(word)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
          {cfg.sub}
        </div>
      </div>
    </div>
  )
}
