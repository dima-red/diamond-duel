import './assets/main.css'

const storedTheme = (() => {
  if (typeof window === 'undefined') return 'system'
  const v = window.localStorage.getItem('diamond-duel-theme')
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
})()
document.documentElement.setAttribute('data-theme', storedTheme)

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
