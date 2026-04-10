import React from 'react'
import clsx from 'clsx'

export function StatTile({ label, children, valueClassName }) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col justify-between gap-0 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-[11px]">
      <div className="text-[10px] font-semibold uppercase tracking-[0.05em] leading-tight text-[var(--text-muted)]">
        {label}
      </div>
      <div
        className={clsx(
          'font-mono text-[17px] font-bold leading-tight tracking-tight text-[var(--text-primary)]',
          valueClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}
