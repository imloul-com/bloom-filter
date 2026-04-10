import React from 'react'
import { HASH_COLORS, rawHashBeforeMod } from '@/utils/hashes'
import { ComputingDots } from './ComputingDots.jsx'

export default function HashSteps({ animState, selectedHashes, word }) {
  const { phase, hashIdx, indices } = animState

  if (!word && phase !== 'lookup-done' && phase !== 'done') {
    return (
      <div style={{
        padding: '16px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: '13px',
        fontFamily: 'var(--font-mono)',
        minHeight: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        Insert or look up a word to see hash calculations
      </div>
    )
  }

  const isLookup = phase === 'probing' || phase === 'probe-result' || phase === 'lookup-done'

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
          {isLookup ? 'Lookup' : 'Insert'} →
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          background: 'var(--bg-raised)',
          padding: '2px 10px',
          borderRadius: 20,
          border: '1px solid var(--border-default)',
        }}>
          "{word}"
        </span>
      </div>

      {/* Hash rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {selectedHashes.map((name, i) => {
          const col = HASH_COLORS[i % HASH_COLORS.length]
          const isCurrent = i === hashIdx
          const idx = indices?.[i]

          let rowState = 'pending'
          if (isCurrent && (phase === 'hashing' || phase === 'probing')) rowState = 'computing'
          else if (isCurrent && (phase === 'setting' || phase === 'probe-result')) rowState = 'done'
          else if (i < hashIdx || phase === 'done' || phase === 'lookup-done') rowState = 'done'

          return (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                borderBottom: i < selectedHashes.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                background: isCurrent
                  ? `${col.bg}`
                  : 'transparent',
                transition: 'background 0.3s',
              }}
            >
              {/* Hash name badge */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 5,
                border: `1px solid ${rowState !== 'pending' ? col.border : 'var(--border-subtle)'}`,
                color: rowState !== 'pending' ? col.color : 'var(--text-muted)',
                background: rowState !== 'pending' ? col.bg : 'transparent',
                minWidth: 72,
                textAlign: 'center',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
              }}>
                {name}
              </div>

              {/* Arrow + formula */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: rowState === 'computing' ? 'var(--text-secondary)' : rowState === 'done' ? 'var(--text-secondary)' : 'var(--text-muted)',
                flex: 1,
                transition: 'color 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexWrap: 'wrap',
              }}>
                {rowState === 'pending' && (
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                )}
                {rowState === 'computing' && (
                  <ComputingDots color={col.color} />
                )}
                {rowState === 'done' && idx !== undefined && (
                  <>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {rawHashBeforeMod(name, word, i)} mod {animState.size ?? '…'} =
                    </span>
                  </>
                )}
              </div>

              {/* Result index */}
              {rowState === 'done' && idx !== undefined && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: col.color,
                  background: col.bg,
                  border: `1px solid ${col.border}`,
                  borderRadius: 6,
                  padding: '3px 10px',
                  minWidth: 36,
                  textAlign: 'center',
                  animation: 'fadeUp 0.3s ease',
                }}>
                  [{idx}]
                </div>
              )}

              {/* Probe result indicator */}
              {isLookup && rowState === 'done' && idx !== undefined && animState.probeResults?.[i] !== undefined && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 5,
                  color: animState.probeResults[i] ? 'var(--h2)' : 'var(--h4)',
                  background: animState.probeResults[i] ? 'var(--semantic-good-bg)' : 'var(--semantic-bad-bg)',
                  border: `1px solid ${animState.probeResults[i] ? 'var(--semantic-good-border)' : 'var(--semantic-bad-border)'}`,
                  animation: 'fadeUp 0.3s ease',
                }}>
                  {animState.probeResults[i] ? '1 ✓' : '0 ✗'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
