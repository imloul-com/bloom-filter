import React from 'react'

export function Label({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      marginTop: 14,
    }}>
      {children}
    </div>
  )
}
