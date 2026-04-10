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
      className="flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 leading-none text-[var(--text-secondary)]"
    >
      {isLight ? (
        <ThemeMoonIcon aria-hidden={true} />
      ) : (
        <ThemeSunIcon aria-hidden={true} />
      )}
    </button>
  )
}
