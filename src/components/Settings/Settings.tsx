import { useState } from 'react'
import clsx from 'clsx'
import {
  HASH_NAMES,
  HASH_COLORS,
  estimateFalsePositiveRate,
  optimalK,
  type HashFunctionName,
} from '@/utils/hashes'
import { Toggle } from './Toggle'
import { Label } from './Label'
import { SIZE_PRESETS } from './constants'

export interface SettingsProps {
  size: number
  maxSize?: number
  selectedHashes: HashFunctionName[]
  onSizeChange: (size: number) => void
  onHashesChange: (hashes: HashFunctionName[]) => void
  animSpeed: number
  onSpeedChange: (speed: number) => void
  insertedCount: number
}

export default function Settings({
  size,
  maxSize = 512,
  selectedHashes,
  onSizeChange,
  onHashesChange,
  animSpeed,
  onSpeedChange,
  insertedCount,
}: SettingsProps) {
  const [open, setOpen] = useState(false)

  const fp = estimateFalsePositiveRate(insertedCount, size, selectedHashes.length)
  const optK = optimalK(size, insertedCount)

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-4 py-3 text-[var(--text-primary)]"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-semibold">Parameters</span>
          <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-tertiary)]">
            m={size} · k={selectedHashes.length} · fp≈{(fp * 100).toFixed(2)}%
          </span>
        </div>
        <span
          className={clsx(
            'text-sm text-[var(--text-tertiary)] transition-transform duration-200',
            open && 'rotate-180',
          )}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="animate-settings-open flex flex-col gap-5 border-t border-[var(--border-subtle)] px-4 pb-4">
          <div>
            <Label>Bit array size (m)</Label>
            <div className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">
              Changing m keeps inserted keys and re-hashes them into the new size. Real Bloom filters only store bits,
              so they cannot resize or change k without the keys — this demo keeps the list on purpose.
            </div>
            {maxSize < 512 && (
              <div className="mt-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                Max {maxSize} bits on this screen size
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SIZE_PRESETS.filter(s => s <= maxSize).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSizeChange(s)}
                  className={clsx(
                    'cursor-pointer rounded-md border border-solid px-3 py-1 font-mono text-xs font-semibold transition-all duration-150',
                    size === s
                      ? 'border-[var(--h1)] bg-[var(--h1-bg)] text-[var(--h1)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--text-secondary)]',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="range"
                min={8}
                max={maxSize}
                step={8}
                value={size}
                onChange={e => onSizeChange(+e.target.value)}
                className="w-full accent-[var(--h1)]"
              />
              <div className="flex justify-between font-mono text-[11px] text-[var(--text-muted)]">
                <span>8</span>
                {maxSize > 16 && <span>{Math.round(maxSize / 2)}</span>}
                <span>{maxSize}</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Hash functions (k = {selectedHashes.length})</Label>
            <div className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">
              Toggling hashes updates k and re-hashes every inserted key into the same m (still demo-only vs a real
              filter).
            </div>
            {insertedCount > 0 && (
              <div className="mt-1.5 text-[11px] text-[var(--h3)]">
                Optimal k for {insertedCount} items: {optK}
              </div>
            )}
            <div className="mt-2.5 flex flex-col gap-1.5">
              {HASH_NAMES.map((name, i) => {
                const col = HASH_COLORS[i % HASH_COLORS.length]!
                const isSelected = selectedHashes.includes(name)
                const canDeselect = selectedHashes.length > 1

                return (
                  <div
                    key={name}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (isSelected && !canDeselect) return
                        if (!isSelected && selectedHashes.length >= 6) return
                        const next = isSelected
                          ? selectedHashes.filter(h => h !== name)
                          : [...selectedHashes, name]
                        onHashesChange(next)
                      }
                    }}
                    className={clsx(
                      'flex items-center justify-between rounded-lg border border-solid px-2.5 py-1.5 transition-all duration-150',
                      (!isSelected || canDeselect) ? 'cursor-pointer' : 'cursor-not-allowed',
                      !isSelected && selectedHashes.length >= 6 && 'opacity-40',
                      !isSelected && 'border-[var(--border-subtle)] bg-[var(--bg-raised)]',
                    )}
                    style={isSelected ? { borderColor: col.border, background: col.bg } : undefined}
                    onClick={() => {
                      if (isSelected && !canDeselect) return
                      if (!isSelected && selectedHashes.length >= 6) return
                      const next = isSelected
                        ? selectedHashes.filter(h => h !== name)
                        : [...selectedHashes, name]
                      onHashesChange(next)
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full transition-colors duration-150"
                        style={{ background: isSelected ? col.color : 'var(--text-muted)' }}
                      />
                      <span
                        className="font-mono text-xs font-semibold transition-colors duration-150"
                        style={{ color: isSelected ? col.color : 'var(--text-muted)' }}
                      >
                        {name}
                      </span>
                    </div>
                    <Toggle
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected && !canDeselect) return
                        if (!isSelected && selectedHashes.length >= 6) return
                        const next = isSelected
                          ? selectedHashes.filter(h => h !== name)
                          : [...selectedHashes, name]
                        onHashesChange(next)
                      }}
                      trackBg={col.bg}
                      thumbColor={col.color}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <Label>Animation speed</Label>
            <div className="mt-2 flex gap-1.5">
              {[
                { label: 'Slow', val: 0.5 },
                { label: 'Normal', val: 1 },
                { label: 'Fast', val: 2 },
                { label: 'Instant', val: 10 },
              ].map(s => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => onSpeedChange(s.val)}
                  className={clsx(
                    'flex-1 cursor-pointer rounded-md border border-solid px-3 py-1 text-xs font-semibold transition-all duration-150',
                    animSpeed === s.val
                      ? 'border-[var(--h2)] bg-[var(--h2-bg)] text-[var(--h2)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-raised)] text-[var(--text-secondary)]',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
