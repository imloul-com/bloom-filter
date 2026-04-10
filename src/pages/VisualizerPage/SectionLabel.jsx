import React from 'react'

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}
