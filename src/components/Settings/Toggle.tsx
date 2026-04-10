import type { CSSProperties } from 'react'
import clsx from 'clsx'

export interface ToggleProps {
  checked: boolean
  onChange: () => void
  trackBg: string
  thumbColor: string
}

export function Toggle({ checked, onChange, trackBg, thumbColor }: ToggleProps) {
  return (
    <div
      tabIndex={0}
      onClick={() => onChange()}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onChange()
        }
      }}
      role="switch"
      aria-checked={checked}
      style={{ '--toggle-track': trackBg, '--toggle-thumb': thumbColor } as CSSProperties}
      className={clsx(
        'relative h-5 w-9 shrink-0 cursor-pointer rounded-[10px] border border-solid transition-all duration-200',
        checked
          ? 'border-[color:var(--toggle-thumb)] bg-[var(--toggle-track)]'
          : 'border-[var(--border-default)] bg-[var(--bg-raised)]',
      )}
    >
      <div
        className={clsx(
          'absolute top-0.5 size-[14px] rounded-full transition-[left,background] duration-200',
          checked ? 'left-[18px] bg-[var(--toggle-thumb)]' : 'left-0.5 bg-[var(--text-tertiary)]',
        )}
      />
    </div>
  )
}
