import React from 'react'

export function Toggle({ checked, onChange, trackBg, thumbColor }) {
  return (
    <div
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onChange(!checked)
        }
      }}
      role="switch"
      aria-checked={checked}
      style={{
        width: 36, height: 20,
        borderRadius: 10,
        background: checked ? trackBg : 'var(--bg-raised)',
        border: `1px solid ${checked ? thumbColor : 'var(--border-default)'}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: checked ? 18 : 2,
        width: 14, height: 14,
        borderRadius: '50%',
        background: checked ? thumbColor : 'var(--text-tertiary)',
        transition: 'left 0.2s, background 0.2s',
      }} />
    </div>
  )
}
