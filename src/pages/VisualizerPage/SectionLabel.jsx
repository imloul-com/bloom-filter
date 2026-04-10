import React from 'react'

export function SectionLabel({ children }) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-tertiary)]">
      {children}
    </div>
  )
}
