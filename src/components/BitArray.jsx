import React, { useEffect, useRef, useState } from 'react'
import { HASH_COLORS } from '@/utils/hashes'

function useScreenBitLimit() {
  const [limit, setLimit] = useState(Infinity)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setLimit(w < 640 ? 64 : w < 1024 ? 128 : Infinity)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return limit
}

const OVERLAP = {
  color: 'var(--overlap-color)',
  bg: 'var(--overlap-bg)',
  border: 'var(--overlap-border)',
  glow: 'var(--overlap-glow)',
}

function getColorForOwners(owners) {
  if (!owners || owners.size === 0) return null
  if (owners.size === 1) return HASH_COLORS[[...owners][0] % HASH_COLORS.length]
  return OVERLAP
}

function BitCell({ index, isOn, owners, animState, style }) {
  const [popKey, setPopKey] = useState(0)
  const [probeKey, setProbeKey] = useState(0)
  /** Match current bit on mount so bulk layout changes (resize re-hash) do not look like inserts. */
  const prevOn = useRef(isOn)

  const isActive = animState.indices?.includes(index)
  const activeHashIdx = animState.indices?.indexOf(index)
  const isCurrentlyProbing = animState.phase === 'probing' && animState.hashIdx === activeHashIdx && animState.indices?.[animState.hashIdx] === index
  const isCurrentlyHashing = (animState.phase === 'hashing' || animState.phase === 'setting') && animState.hashIdx === activeHashIdx && animState.indices?.[animState.hashIdx] === index

  useEffect(() => {
    if (isOn && !prevOn.current) setPopKey(k => k + 1)
    prevOn.current = isOn
  }, [isOn])

  useEffect(() => {
    if (isCurrentlyProbing) setProbeKey(k => k + 1)
  }, [isCurrentlyProbing])

  const col = getColorForOwners(owners)
  const hColor = activeHashIdx >= 0 ? HASH_COLORS[activeHashIdx % HASH_COLORS.length] : null

  const isHighlighted = isCurrentlyHashing || isCurrentlyProbing

  return (
    <div
      style={{
        position: 'relative',
        zIndex: isHighlighted ? 10 : 1,
        width: 'var(--cell-size)',
        height: 'var(--cell-size)',
        borderRadius: 'var(--cell-radius)',
        border: `1px solid ${isHighlighted ? (hColor?.border || col?.border || 'var(--border-subtle)') : isOn ? (col?.border || 'var(--border-default)') : 'var(--border-subtle)'}`,
        background: isHighlighted
          ? (hColor?.bg || col?.bg || 'var(--bg-raised)')
          : isOn
            ? (col?.bg || 'var(--bg-raised)')
            : 'var(--bg-raised)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.25s, border-color 0.25s',
        boxShadow: isHighlighted
          ? `0 0 16px 2px ${hColor?.glow || col?.glow || 'transparent'}`
          : isOn && col
            ? `0 0 8px 0px ${col.glow}`
            : 'none',
        ...style,
      }}
    >
      {/* Pop animation layer */}
      {popKey > 0 && (
        <div key={`pop-${popKey}`} style={{
          position: 'absolute', inset: -4,
          borderRadius: 'inherit',
          border: `2px solid ${col?.color || 'var(--text-primary)'}`,
          animation: 'bitPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          pointerEvents: 'none',
        }} />
      )}
      {/* Probe ripple */}
      {probeKey > 0 && (
        <div key={`probe-${probeKey}`} style={{
          position: 'absolute', inset: -6,
          borderRadius: 'inherit',
          border: `1.5px solid ${hColor?.color || 'var(--text-primary)'}`,
          animation: 'probeRipple 0.55s ease-out forwards',
          pointerEvents: 'none',
        }} />
      )}

      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(11px, var(--cell-font), 16px)',
        fontWeight: 600,
        color: isHighlighted
          ? (hColor?.color || col?.color || 'var(--text-secondary)')
          : isOn
            ? (col?.color || 'var(--text-secondary)')
            : 'var(--text-muted)',
        transition: 'color 0.2s',
        lineHeight: 1,
      }}>
        {isOn ? '1' : '0'}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(7px, var(--cell-idx-font), 10px)',
        color: isHighlighted ? (hColor?.color || 'var(--text-tertiary)') : 'var(--text-muted)',
        position: 'absolute',
        bottom: '2px',
        lineHeight: 1,
        transition: 'color 0.2s',
      }}>
        {index}
      </span>
    </div>
  )
}

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
