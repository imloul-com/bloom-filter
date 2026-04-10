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
    <div
      className="flex animate-result-in items-start gap-3 rounded-lg border border-solid px-4 py-3"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <span className="text-[22px] leading-tight" style={{ color: cfg.color }}>{cfg.icon}</span>
      <div>
        <div className="text-sm font-bold" style={{ color: cfg.color }}>
          {cfg.title(word)}
        </div>
        <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
          {cfg.sub}
        </div>
      </div>
    </div>
  )
}
