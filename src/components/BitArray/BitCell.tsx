import { useEffect, useRef, useState, type CSSProperties } from 'react'
import clsx from 'clsx'
import { HASH_COLORS, type HashPalette } from '@/utils/hashes'
import type { BloomAnimStateView } from '@/types/bloom'

const OVERLAP: HashPalette = {
  key: 'overlap',
  color: 'var(--overlap-color)',
  bg: 'var(--overlap-bg)',
  border: 'var(--overlap-border)',
  glow: 'var(--overlap-glow)',
}

function getColorForOwners(owners: Set<number> | undefined): HashPalette | null {
  if (!owners || owners.size === 0) return null
  if (owners.size === 1) return HASH_COLORS[[...owners][0]! % HASH_COLORS.length] ?? null
  return OVERLAP
}

export interface BitCellProps {
  index: number
  isOn: boolean
  owners: Set<number> | undefined
  animState: BloomAnimStateView
  className?: string
  style?: CSSProperties
}

export function BitCell({ index, isOn, owners, animState, className, style }: BitCellProps) {
  const [popKey, setPopKey] = useState(0)
  const [probeKey, setProbeKey] = useState(0)
  /** Match current bit on mount so bulk layout changes (resize re-hash) do not look like inserts. */
  const prevOn = useRef(isOn)

  const activeHashIdx = animState.indices.indexOf(index)
  const isCurrentlyProbing =
    animState.phase === 'probing' &&
    animState.hashIdx === activeHashIdx &&
    animState.indices[animState.hashIdx] === index
  const isCurrentlyHashing =
    (animState.phase === 'hashing' || animState.phase === 'setting') &&
    animState.hashIdx === activeHashIdx &&
    animState.indices[animState.hashIdx] === index

  useEffect(() => {
    if (isOn && !prevOn.current) setPopKey(k => k + 1)
    prevOn.current = isOn
  }, [isOn])

  useEffect(() => {
    if (isCurrentlyProbing) setProbeKey(k => k + 1)
  }, [isCurrentlyProbing])

  const col = getColorForOwners(owners)
  const hColor = activeHashIdx >= 0 ? HASH_COLORS[activeHashIdx % HASH_COLORS.length] : undefined

  const isHighlighted = isCurrentlyHashing || isCurrentlyProbing

  const borderColor = isHighlighted
    ? (hColor?.border || col?.border || 'var(--border-subtle)')
    : isOn
      ? (col?.border || 'var(--border-default)')
      : 'var(--border-subtle)'
  const backgroundColor = isHighlighted
    ? (hColor?.bg || col?.bg || 'var(--bg-raised)')
    : isOn
      ? (col?.bg || 'var(--bg-raised)')
      : 'var(--bg-raised)'
  const boxShadow = isHighlighted
    ? `0 0 16px 2px ${hColor?.glow || col?.glow || 'transparent'}`
    : isOn && col
      ? `0 0 8px 0px ${col.glow}`
      : 'none'

  const digitColor = isHighlighted
    ? (hColor?.color || col?.color || 'var(--text-secondary)')
    : isOn
      ? (col?.color || 'var(--text-secondary)')
      : 'var(--text-muted)'
  const indexColor = isHighlighted ? (hColor?.color || 'var(--text-tertiary)') : 'var(--text-muted)'

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center justify-center rounded-[var(--cell-radius)] border border-solid transition-[background,border-color] duration-250',
        'h-[var(--cell-size)] w-[var(--cell-size)]',
        isHighlighted ? 'z-10' : 'z-[1]',
        className,
      )}
      style={{ borderColor, backgroundColor, boxShadow, ...style }}
    >
      {popKey > 0 && (
        <div
          key={`pop-${popKey}`}
          className="pointer-events-none absolute inset-[-4px] rounded-[inherit] border-2 animate-bit-pop"
          style={{ borderColor: col?.color || 'var(--text-primary)' }}
        />
      )}
      {probeKey > 0 && (
        <div
          key={`probe-${probeKey}`}
          className="pointer-events-none absolute inset-[-6px] rounded-[inherit] border-[1.5px] animate-probe-ripple"
          style={{ borderColor: hColor?.color || 'var(--text-primary)' }}
        />
      )}

      <span
        className="font-mono text-[length:clamp(11px,var(--cell-font),16px)] font-semibold leading-none transition-colors duration-200"
        style={{ color: digitColor }}
      >
        {isOn ? '1' : '0'}
      </span>
      <span
        className="absolute bottom-0.5 font-mono text-[length:clamp(7px,var(--cell-idx-font),10px)] leading-none transition-colors duration-200"
        style={{ color: indexColor }}
      >
        {index}
      </span>
    </div>
  )
}
