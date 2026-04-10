import React from 'react'

export function Btn({ label, shortcut, color, bg, border, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 44,
        padding: '0 18px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${border}`,
        background: disabled ? 'transparent' : bg,
        color: disabled ? 'var(--text-muted)' : color,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'opacity 0.15s, transform 0.1s',
        opacity: disabled ? 0.4 : 1,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.8' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1)' }}
    >
      {label}
      {shortcut && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          opacity: 0.6,
          background: 'var(--bg-raised)',
          padding: '1px 5px',
          borderRadius: 3,
          border: '1px solid var(--border-subtle)',
        }}>
          {shortcut}
        </span>
      )}
    </button>
  )
}
