import React from 'react'

export default function InsertedList({ items }) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)',
        marginBottom: 8,
      }}>
        Inserted items ({items.length})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28 }}>
        {items.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            None yet
          </span>
        )}
        {items.map((w, i) => (
          <span
            key={w + i}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 20,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-raised)',
              color: 'var(--text-secondary)',
              animation: 'chipIn 0.25s cubic-bezier(0.34,1.4,0.64,1)',
            }}
          >
            {w}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes chipIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
