import { ref, onMounted, watch } from 'vue'

const THEME_KEY = 'theme'
const theme = ref('dark')

function applyTheme(value) {
  document.body.classList.remove('dark', 'light')
  document.body.classList.add(value)
}

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  onMounted(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') {
      theme.value = saved
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }

    applyTheme(theme.value)
  })

  watch(theme, (value) => {
    applyTheme(value)
    localStorage.setItem(THEME_KEY, value)
  })

  return { theme, toggleTheme }
}