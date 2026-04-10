import React from 'react'
import { useTheme } from '@/hooks/useTheme'
import ThemeSunIcon from '@/assets/icons/theme-sun.svg?react'
import ThemeMoonIcon from '@/assets/icons/theme-moon.svg?react'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      aria-pressed={isLight}
      style={{
        flexShrink: 0,
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        lineHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {isLight ? (
        <ThemeMoonIcon aria-hidden={true} />
      ) : (
        <ThemeSunIcon aria-hidden={true} />
      )}
    </button>
  )
}
