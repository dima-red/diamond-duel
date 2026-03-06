import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'diamond-duel-theme'

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function useTheme() {
  const theme = ref<Theme>(getStoredTheme())

  applyTheme(theme.value)

  watch(
    theme,
    (value) => {
      applyTheme(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, value)
      }
    },
    { immediate: false },
  )

  function setTheme(value: Theme) {
    theme.value = value
  }

  return { theme, setTheme }
}
