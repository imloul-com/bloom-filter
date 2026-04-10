import type { PropsWithChildren } from 'react'

export function SectionLabel({ children }: PropsWithChildren) {
  return (
    <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-tertiary)]">
      {children}
    </div>
  )
}
