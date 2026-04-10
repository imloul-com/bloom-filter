import React, { useEffect, useRef, useState } from 'react'
import { HASH_COLORS } from '@/utils/hashes'

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

export function BitCell({ index, isOn, owners, animState, style }) {
  const [popKey, setPopKey] = useState(0)
  const [probeKey, setProbeKey] = useState(0)
  /** Match current bit on mount so bulk layout changes (resize re-hash) do not look like inserts. */
  const prevOn = useRef(isOn)

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
