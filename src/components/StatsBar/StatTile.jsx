import React from 'react'
import { tile, tileLabel } from './statsBarStyles.js'

export function StatTile({ label, children, valueStyle = {} }) {
  return (
    <div
      style={{
        ...tile,
        gap: 0,
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div style={tileLabel}>{label}</div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          ...valueStyle,
        }}
      >
        {children}
      </div>
    </div>
  )
}
