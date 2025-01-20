import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EventCreationView from '../views/EventCreationView.vue'
import EventEditView from '../views/EventEditView.vue'
import RegistrationView from '../views/RegistrationView.vue'
import DeleteEventView from '../views/DeleteEventView.vue'
import ParticipantListView from '../views/ParticipantListView.vue'
import FinishEventView from '../views/FinishEventView.vue'

import { get } from '../utils/api'

const router = createRouter({
  history: createWebHistory( import.meta.env.BASE_URL ),
  routes: [
    { 
      path: '/', 
      component: HomeView 
    },
    { 
      path: '/create', 
      name: 'createEvent', 
      component: EventCreationView 
    },
    { 
      path: '/edit/:id', 
      name: 'edit', 
      component: EventEditView,
      props: true, 
    },
    { 
      path: '/registration/:id', 
      name: 'registration', 
      component: () => import('../views/RegistrationView.vue'), 
      props: true, 
      beforeEnter: async ( to, from, next ) => {
        const initData = window.Telegram.WebApp.initData || ''
        const decodedInitData = decodeURIComponent( initData )
        const params = new URLSearchParams( decodedInitData )
        const userParam = params.get( 'user' )

        let extractedUsername = null
        if ( userParam ) {
          const user = JSON.parse( userParam )
          extractedUsername = user.username
        }

        if ( !extractedUsername ) {
          console.error( 'Не удалось извлечь имя пользователя из initData.' )
          return next( '/' ) // Перенаправляем на главную страницу
        }

        const eventId = to.params.id
        try {
          const data = await get( `/api/v1/events/${ eventId }/participants` )
          if (!data || !data.participants) throw new Error( 'Участники не найдены.' )

          const isRegistred = data.participants.some(
            ( participant ) => participant.username === extractedUsername
          )

          if ( isRegistred ) {
            // Если пользователь зарегистрирован, перенаправляем на главную страницу
            return next( '/' )
          }
        } catch ( error ) {
          console.error( 'Ошибка загрузки участников:', error )
        }

        // Если пользователь не зарегистрирован, продолжаем переход к странице регистрации
        next()
      },
    },
    {
      path: '/participants/:id',
      name: 'participants',
      component: ParticipantListView,
      props: true, 
    },
    { 
      path: '/delete-event/:id', 
      name: 'delete',
      component: DeleteEventView,
      props: true,  
    },
    { 
      path: '/finish-event/:id', 
      name: 'finish',
      component: FinishEventView,
      props: true,  
    },
  ],
})

export default router
