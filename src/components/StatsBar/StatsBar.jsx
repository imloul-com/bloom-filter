import React from 'react'
import { estimateFalsePositiveRate, EST_FP_RATE_MODERATE, EST_FP_RATE_SEVERE } from '@/utils/hashes'
import {
  compareBloomVsHashSet,
  formatBytes,
  HASH_SET_ENTRY_OVERHEAD_BYTES,
} from '@/utils/memoryFootprint'
import { StatTile } from './StatTile.jsx'
import { sectionTitle, tile, tileLabel } from './statsBarStyles.js'

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

  const savedColor = insertedItems.length
    ? savedBytes > 0
      ? 'var(--h2)'
      : savedBytes < 0
        ? 'var(--text-tertiary)'
        : 'var(--text-primary)'
    : 'var(--text-muted)'

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div>
        <div style={sectionTitle}>Bit array</div>
        <div
          style={{
            ...tile,
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 8,
          }}
        >
          <div style={tileLabel}>Saturation</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              minWidth: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: 8,
                borderRadius: 4,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${fillPct}%`,
                  borderRadius: 3,
                  background:
                    fillPct > 80 ? 'var(--h4)' : fillPct > 50 ? 'var(--h3)' : 'var(--h1)',
                  transition: 'width 0.4s ease, background 0.4s ease',
                }}
              />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {setBits}/{size} bits · {fillPct}%
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={sectionTitle}>Filter metrics</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))',
            gap: 10,
            alignItems: 'stretch',
          }}
        >
          <StatTile label="Items inserted">{insertedItems.length}</StatTile>
          <StatTile label="Bits set to 1">{setBits}</StatTile>
          <StatTile
            label="Est. false positive"
            valueStyle={{
              color: fp > EST_FP_RATE_SEVERE ? 'var(--h4)' : fp > EST_FP_RATE_MODERATE ? 'var(--h3)' : 'var(--h2)',
            }}
          >
            {(fp * 100).toFixed(2)}%
          </StatTile>
        </div>
      </div>

      <div>
        <div style={sectionTitle}>Memory vs exact hash set</div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))',
            gap: 10,
            alignItems: 'stretch',
          }}
        >
          <StatTile label="Bloom (bit array)">{formatBytes(bloomBytes)}</StatTile>
          <StatTile label="Hash set (estimated)">
            {insertedItems.length ? formatBytes(hashSetBytes) : '—'}
          </StatTile>
          <StatTile label="Space saved" valueStyle={{ color: savedColor }}>
            {savedDisplay}
          </StatTile>
        </div>
        <p
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'var(--bg-raised)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: 11,
            lineHeight: 1.5,
            color: 'var(--text-muted)',
          }}
        >
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
