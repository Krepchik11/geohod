import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueTelegramPlugin } from 'vue-tg'

import App from './App.vue'
import router from './router'

const app = createApp( App )

if ( window.Telegram?.WebApp ) {
    const themeParams = window.Telegram.WebApp.themeParams || {}
    app.provide( 'themeParams', themeParams )
}

app.use( createPinia() )
app.use( router )
app.use( VueTelegramPlugin )

const params = new URLSearchParams( window.Telegram?.WebApp?.initData || window.location.search )
const startAppParam = params.get('startapp')

router.isReady().then(() => {
  if ( startAppParam?.startsWith( 'registration_' ) ) {
    const eventId = startAppParam.replace( 'registration_', '' )

    console.log('Startapp Param:', startAppParam);
    console.log('Navigating to registration:', { name: 'registration', params: { id: eventId } });

    router.push({ name: 'registration', params: { id: eventId } }).catch( console.error )
  }
})

  


app.mount( '#app' )
