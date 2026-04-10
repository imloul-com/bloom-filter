import React from 'react'
import { BitCell } from './BitCell.jsx'
import { useScreenBitLimit } from './useScreenBitLimit.js'

export default function BitArray({ bits, bitOwners, animState, size, layoutEpoch = 0 }) {
  const screenBitLimit = useScreenBitLimit()
  const visibleCount = Math.min(size, screenBitLimit)
  const hiddenCount = size - visibleCount

  const cellSize = size <= 32 ? 44 : size <= 64 ? 36 : size <= 128 ? 28 : 22
  const cellFont = size <= 32 ? 15 : size <= 64 ? 13 : size <= 128 ? 11 : 9
  const cellIdxFont = size <= 32 ? 9 : size <= 64 ? 8 : 7
  const cellRadius = size <= 64 ? 7 : 5

  return (
    <div style={{
      '--cell-size': `${cellSize}px`,
      '--cell-font': `${cellFont}px`,
      '--cell-idx-font': `${cellIdxFont}px`,
      '--cell-radius': `${cellRadius}px`,
    }}>
      <style>{`
        @keyframes bitPop {
          0%   { opacity: 1; transform: scale(1); }
          40%  { opacity: 0.8; transform: scale(1.35); }
          70%  { opacity: 0.4; transform: scale(1.6); }
          100% { opacity: 0; transform: scale(2); }
        }
        @keyframes probeRipple {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.8); }
        }
      `}</style>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: size <= 64 ? 5 : 4,
        padding: '14px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
      }}>
        {bits.slice(0, visibleCount).map((bit, i) => (
          <BitCell
            key={`${layoutEpoch}-${i}`}
            index={i}
            isOn={bit === 1}
            owners={bitOwners[i]}
            animState={animState}
          />
        ))}
        {hiddenCount > 0 && (
          <div style={{
            width: '100%',
            textAlign: 'center',
            padding: '6px 0 2px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            +{hiddenCount} more bits — use a smaller filter size or a wider screen to see all
          </div>
        )}
      </div>
    </div>
  )
}
