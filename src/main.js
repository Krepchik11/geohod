import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueTelegramPlugin } from 'vue-tg'

import App from './App.vue'
import router from './router'

const app = createApp(App)

if (window.Telegram?.WebApp) {
    const themeParams = window.Telegram.WebApp.themeParams || {}
    app.provide('themeParams', themeParams)
}

const params = new URLSearchParams( window.Telegram?.WebApp?.initData || window.location.search )
const startAppParam = params.get('startapp')

if (startAppParam?.startsWith( 'registration_' )) {
  const eventId = startAppParam.replace( 'registration_', '' )
  router.push({ name: 'registration', params: { id: eventId } })
}

app.use(createPinia())
app.use(router)
app.use(VueTelegramPlugin)

app.mount('#app')
