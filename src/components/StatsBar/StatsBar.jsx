import React from 'react'
import { estimateFalsePositiveRate, EST_FP_RATE_MODERATE, EST_FP_RATE_SEVERE } from '@/utils/hashes'
import {
  compareBloomVsHashSet,
  formatBytes,
  HASH_SET_ENTRY_OVERHEAD_BYTES,
} from '@/utils/memoryFootprint'
import { StatTile } from './StatTile.jsx'

export default function StatsBar({ bits, insertedItems, size, k }) {
  const setBits = bits.filter(Boolean).length
  const fp = estimateFalsePositiveRate(insertedItems.length, size, k)
  const fillPct = Math.round((setBits / size) * 100)
  const { bloomBytes, hashSetBytes, savedBytes, savingsPct } = compareBloomVsHashSet(size, insertedItems)

  const savedDisplay = insertedItems.length
    ? savedBytes >= 0
      ? `${formatBytes(savedBytes)}${savingsPct != null ? ` (${savingsPct.toFixed(0)}%)` : ''}`
      : `${formatBytes(-savedBytes)} larger`
    : '—'

  const savedValueClass = !insertedItems.length
    ? 'text-[var(--text-muted)]'
    : savedBytes > 0
      ? 'text-[var(--h2)]'
      : savedBytes < 0
        ? 'text-[var(--text-tertiary)]'
        : ''

  const fpValueClass = fp > EST_FP_RATE_SEVERE
    ? 'text-[var(--h4)]'
    : fp > EST_FP_RATE_MODERATE
      ? 'text-[var(--h3)]'
      : 'text-[var(--h2)]'

  const barColor = fillPct > 80 ? 'var(--h4)' : fillPct > 50 ? 'var(--h3)' : 'var(--h1)'

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-[18px] py-4">
      <div>
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Bit array
        </div>
        <div className="flex flex-col gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-[11px]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.05em] leading-tight text-[var(--text-muted)]">
            Saturation
          </div>
          <div className="flex min-w-0 flex-row items-center gap-3">
            <div className="flex h-2 min-h-0 min-w-0 flex-1 overflow-hidden rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div
                className="h-full rounded-[3px] transition-[width,background] duration-[400ms] ease-in-out"
                style={{ width: `${fillPct}%`, background: barColor }}
              />
            </div>
            <div className="shrink-0 whitespace-nowrap font-mono text-[13px] font-semibold leading-none text-[var(--text-secondary)]">
              {setBits}/{size} bits · {fillPct}%
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Filter metrics
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(112px,1fr))] items-stretch gap-2.5">
          <StatTile label="Items inserted">{insertedItems.length}</StatTile>
          <StatTile label="Bits set to 1">{setBits}</StatTile>
          <StatTile label="Est. false positive" valueClassName={fpValueClass}>
            {(fp * 100).toFixed(2)}%
          </StatTile>
        </div>
      </div>

      <div>
        <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Memory vs exact hash set
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(112px,1fr))] items-stretch gap-2.5">
          <StatTile label="Bloom (bit array)">{formatBytes(bloomBytes)}</StatTile>
          <StatTile label="Hash set (estimated)">
            {insertedItems.length ? formatBytes(hashSetBytes) : '—'}
          </StatTile>
          <StatTile label="Space saved" valueClassName={savedValueClass}>
            {savedDisplay}
          </StatTile>
        </div>
        <p className="mt-3 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-2.5 text-[11px] leading-snug text-[var(--text-muted)]">
          Bloom uses ⌈m/8⌉ bytes for the bit vector. The hash-set estimate is UTF-8 key size plus ~{HASH_SET_ENTRY_OVERHEAD_BYTES}
          {' '}
          B per entry (runtime object overhead).
          {insertedItems.length === 0 && ' Insert keys to compare footprints.'}
          {insertedItems.length > 0 && savedBytes < 0 && ' With very few short keys and a large m, exact storage can be smaller than the filter.'}
        </p>
      </div>
    </div>
  )
}
