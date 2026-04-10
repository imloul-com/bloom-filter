import React, { useState } from 'react'
import { HASH_NAMES, HASH_COLORS, estimateFalsePositiveRate, optimalK } from '@/utils/hashes'
import { Toggle } from './Toggle.jsx'
import { Label } from './Label.jsx'
import { SIZE_PRESETS } from './constants.js'

export default function Settings({ size, maxSize = 512, selectedHashes, onSizeChange, onHashesChange, animSpeed, onSpeedChange, insertedCount }) {
  const [open, setOpen] = useState(false)

  const fp = estimateFalsePositiveRate(insertedCount, size, selectedHashes.length)
  const optK = optimalK(size, insertedCount)

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Parameters</span>
          <span style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-tertiary)',
            background: 'var(--bg-raised)',
            padding: '2px 8px',
            borderRadius: 4,
            border: '1px solid var(--border-subtle)',
          }}>
            m={size} · k={selectedHashes.length} · fp≈{(fp * 100).toFixed(2)}%
          </span>
        </div>
        <span style={{
          fontSize: 14,
          color: 'var(--text-tertiary)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          animation: 'settingsOpen 0.2s ease',
        }}>
          <style>{`
            @keyframes settingsOpen {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Bit array size */}
          <div>
            <Label>Bit array size (m)</Label>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>
              Changing m keeps inserted keys and re-hashes them into the new size. Real Bloom filters only store bits,
              so they cannot resize or change k without the keys — this demo keeps the list on purpose.
            </div>
            {maxSize < 512 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                Max {maxSize} bits on this screen size
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {SIZE_PRESETS.filter(s => s <= maxSize).map(s => (
                <button
                  key={s}
                  onClick={() => onSizeChange(s)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: `1px solid ${size === s ? 'var(--h1)' : 'var(--border-default)'}`,
                    background: size === s ? 'var(--h1-bg)' : 'var(--bg-raised)',
                    color: size === s ? 'var(--h1)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <input
                type="range"
                min={8} max={maxSize} step={8}
                value={size}
                onChange={e => onSizeChange(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--h1)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>8</span>
                {maxSize > 16 && <span>{Math.round(maxSize / 2)}</span>}
                <span>{maxSize}</span>
              </div>
            </div>
          </div>

          {/* Hash functions */}
          <div>
            <Label>Hash functions (k = {selectedHashes.length})</Label>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>
              Toggling hashes updates k and re-hashes every inserted key into the same m (still demo-only vs a real
              filter).
            </div>
            {insertedCount > 0 && (
              <div style={{ fontSize: 11, color: 'var(--h3)', marginTop: 6 }}>
                Optimal k for {insertedCount} items: {optK}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {HASH_NAMES.map((name, i) => {
                const col = HASH_COLORS[i % HASH_COLORS.length]
                const isSelected = selectedHashes.includes(name)
                const canDeselect = selectedHashes.length > 1

                return (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? col.border : 'var(--border-subtle)'}`,
                      background: isSelected ? col.bg : 'var(--bg-raised)',
                      transition: 'all 0.15s',
                      cursor: (!isSelected || canDeselect) ? 'pointer' : 'not-allowed',
                      opacity: !isSelected && selectedHashes.length >= 6 ? 0.4 : 1,
                    }}
                    onClick={() => {
                      if (isSelected && !canDeselect) return
                      if (!isSelected && selectedHashes.length >= 6) return
                      const next = isSelected
                        ? selectedHashes.filter(h => h !== name)
                        : [...selectedHashes, name]
                      onHashesChange(next)
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: isSelected ? col.color : 'var(--text-muted)',
                        flexShrink: 0,
                        transition: 'background 0.15s',
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: isSelected ? col.color : 'var(--text-muted)',
                      }}>
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

          {/* Animation speed */}
          <div>
            <Label>Animation speed</Label>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[
                { label: 'Slow', val: 0.5 },
                { label: 'Normal', val: 1 },
                { label: 'Fast', val: 2 },
                { label: 'Instant', val: 10 },
              ].map(s => (
                <button
                  key={s.val}
                  onClick={() => onSpeedChange(s.val)}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: `1px solid ${animSpeed === s.val ? 'var(--h2)' : 'var(--border-default)'}`,
                    background: animSpeed === s.val ? 'var(--h2-bg)' : 'var(--bg-raised)',
                    color: animSpeed === s.val ? 'var(--h2)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    flex: 1,
                    transition: 'all 0.15s',
                  }}
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
