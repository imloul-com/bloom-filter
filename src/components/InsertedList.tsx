export interface InsertedListProps {
  items: readonly string[]
}

export default function InsertedList({ items }: InsertedListProps) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-[var(--text-tertiary)]">
        Inserted items ({items.length})
      </div>
      <div className="flex min-h-[28px] flex-wrap gap-1.5">
        {items.length === 0 && (
          <span className="font-mono text-xs text-[var(--text-muted)]">
            None yet
          </span>
        )}
        {items.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="animate-chip-in rounded-full border border-[var(--border-default)] bg-[var(--bg-raised)] px-2.5 py-0.5 font-mono text-xs text-[var(--text-secondary)]"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  )
}
