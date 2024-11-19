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

app.use(createPinia())
app.use(router)
app.use(VueTelegramPlugin)

app.mount('#app')
