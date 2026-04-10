import React from 'react'

export function Label({ children }) {
  return (
    <div className="mt-3.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-tertiary)]">
      {children}
    </div>
  )
}
