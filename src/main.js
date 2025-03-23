import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueTelegramPlugin } from 'vue-tg'

import App from './App.vue'
import router from './router'

// Create app instance
const app = createApp(App)

// Initialize theme params
const initThemeParams = () => {
  if (window.Telegram?.WebApp) {
    // Inject theme params into CSS variables
    const themeParams = window.Telegram.WebApp.themeParams || {}
    Object.entries(themeParams).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--tg-theme-${key}`, value)
    })
    
    // Provide theme params to components
    app.provide('themeParams', themeParams)
  }
}

// Handle deep linking
const handleDeepLink = () => {
  const initData = window.Telegram?.WebApp?.initData || window.location.search
  const params = new URLSearchParams(initData)
  const startAppParam = params.get('start_param')

  if (startAppParam?.startsWith('registration_')) {
    const eventId = startAppParam.replace('registration_', '')
    router.push({ 
      name: 'registration', 
      params: { id: eventId } 
    }).catch(console.error)
  }
}

// Initialize app
const initApp = async () => {
  // Initialize plugins
  app.use(createPinia())
  app.use(router)
  app.use(VueTelegramPlugin)

  // Setup theme and routing
  initThemeParams()
  await router.isReady()
  handleDeepLink()

  // Mount app
  app.mount('#app')
}

initApp()
