import clsx from 'clsx'
import { HASH_COLORS, rawHashBeforeMod, type HashFunctionName } from '@/utils/hashes'
import { ComputingDots } from './ComputingDots'
import type { BloomAnimStateView } from '@/types/bloom'

export interface HashStepsProps {
  animState: BloomAnimStateView
  selectedHashes: readonly HashFunctionName[]
  word: string
}

export default function HashSteps({ animState, selectedHashes, word }: HashStepsProps) {
  const { phase, hashIdx, indices } = animState

  if (!word && phase !== 'lookup-done' && phase !== 'done') {
    return (
      <div className="flex min-h-20 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 font-mono text-[13px] text-[var(--text-muted)]">
        Insert or look up a word to see hash calculations
      </div>
    )
  }

  const isLookup = phase === 'probing' || phase === 'probe-result' || phase === 'lookup-done'

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-3.5 py-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          {isLookup ? 'Lookup' : 'Insert'} →
        </span>
        <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-raised)] px-2.5 py-0.5 font-mono text-[13px] font-semibold text-[var(--text-primary)]">
          &quot;{word}&quot;
        </span>
      </div>

      <div className="flex flex-col">
        {selectedHashes.map((name, i) => {
          const col = HASH_COLORS[i % HASH_COLORS.length]!
          const isCurrent = i === hashIdx
          const idx = indices[i]

          let rowState: 'pending' | 'computing' | 'done' = 'pending'
          if (isCurrent && (phase === 'hashing' || phase === 'probing')) rowState = 'computing'
          else if (isCurrent && (phase === 'setting' || phase === 'probe-result')) rowState = 'done'
          else if (i < hashIdx || phase === 'done' || phase === 'lookup-done') rowState = 'done'

          const formulaColor = rowState === 'computing' || rowState === 'done'
            ? 'text-[var(--text-secondary)]'
            : 'text-[var(--text-muted)]'

          return (
            <div
              key={name}
              className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] px-3.5 py-2.5 transition-[background] duration-300 last:border-b-0"
              style={isCurrent ? { background: col.bg } : undefined}
            >
              <div
                className={clsx(
                  'min-w-[72px] whitespace-nowrap rounded border border-solid px-2 py-0.5 text-center font-mono text-[11px] font-semibold transition-all duration-300',
                  rowState === 'pending' && 'border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)]',
                )}
                style={rowState !== 'pending' ? { borderColor: col.border, color: col.color, background: col.bg } : undefined}
              >
                {name}
              </div>

              <div className={clsx('flex min-w-0 flex-1 flex-wrap items-center gap-1.5 font-mono text-xs transition-colors duration-300', formulaColor)}>
                {rowState === 'pending' && (
                  <span className="text-[var(--text-muted)]">—</span>
                )}
                {rowState === 'computing' && (
                  <ComputingDots color={col.color} />
                )}
                {rowState === 'done' && idx !== undefined && (
                  <span className="text-[var(--text-secondary)]">
                    {rawHashBeforeMod(name, word, i)} mod {animState.size ?? '…'} =
                  </span>
                )}
              </div>

              {rowState === 'done' && idx !== undefined && (
                <div
                  className="min-w-9 animate-fade-up rounded-md border border-solid px-2.5 py-0.5 text-center font-mono text-[13px] font-bold"
                  style={{ color: col.color, background: col.bg, borderColor: col.border }}
                >
                  [{idx}]
                </div>
              )}

              {isLookup && rowState === 'done' && idx !== undefined && animState.probeResults[i] !== undefined && (
                <div
                  className={clsx(
                    'animate-fade-up rounded border px-2 py-0.5 font-mono text-[11px] font-semibold',
                    animState.probeResults[i]
                      ? 'border-[var(--semantic-good-border)] bg-[var(--semantic-good-bg)] text-[var(--h2)]'
                      : 'border-[var(--semantic-bad-border)] bg-[var(--semantic-bad-bg)] text-[var(--h4)]',
                  )}
                >
                  {animState.probeResults[i] ? '1 ✓' : '0 ✗'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
