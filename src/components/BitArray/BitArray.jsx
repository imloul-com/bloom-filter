import React from 'react'
import clsx from 'clsx'
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
    <div
      style={{
        '--cell-size': `${cellSize}px`,
        '--cell-font': `${cellFont}px`,
        '--cell-idx-font': `${cellIdxFont}px`,
        '--cell-radius': `${cellRadius}px`,
      }}
    >
      <div
        className={clsx(
          'flex flex-wrap justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-[14px]',
          size <= 64 ? 'gap-[5px]' : 'gap-1',
        )}
      >
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
          <div className="w-full py-1.5 pt-1.5 pb-0.5 text-center font-mono text-[11px] text-[var(--text-muted)]">
            +{hiddenCount} more bits — use a smaller filter size or a wider screen to see all
          </div>
        )}
      </div>
    </div>
  )
}
