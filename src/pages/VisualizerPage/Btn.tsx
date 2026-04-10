import type { CSSProperties } from 'react'
import clsx from 'clsx'

export interface BtnProps {
  label: string
  shortcut?: string
  color: string
  bg: string
  border: string
  onClick: () => void
  disabled?: boolean
}

export function Btn({ label, shortcut, color, bg, border, onClick, disabled }: BtnProps) {
  const vars = { '--btn-fg': color, '--btn-bg': bg, '--btn-bd': border } as CSSProperties

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={vars}
      className={clsx(
        'flex h-11 items-center gap-1.5 whitespace-nowrap rounded-md border border-solid border-[color:var(--btn-bd)] px-[18px] font-display text-[13px] font-bold transition-[opacity,transform] duration-150',
        'disabled:cursor-not-allowed disabled:border-[color:var(--btn-bd)] disabled:bg-transparent disabled:text-[var(--text-muted)] disabled:opacity-40',
        !disabled && 'cursor-pointer hover:opacity-80 active:scale-[0.97]',
        !disabled && bg !== 'transparent' && 'bg-[var(--btn-bg)] text-[color:var(--btn-fg)]',
        !disabled && bg === 'transparent' && 'bg-transparent text-[color:var(--btn-fg)]',
      )}
    >
      {label}
      {shortcut && (
        <span className="rounded border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-[5px] py-px font-mono text-[10px] opacity-60">
          {shortcut}
        </span>
      )}
    </button>
  )
}
