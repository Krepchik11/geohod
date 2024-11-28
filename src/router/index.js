import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EventCreationView from '../views/EventCreationView.vue'
import RegistrationView from '../views/RegistrationView.vue'

const router = createRouter({
  history: createWebHistory( import.meta.env.BASE_URL ),
  routes: [
    { path: '/', component: HomeView },
    { path: '/creation', component: EventCreationView },
    { 
      path: '/registration/:id', 
      name: 'registration', 
      component: () => import('../views/RegistrationView.vue'), 
      props: true, 
    },
    { 
      path: '/delete-event/:id', 
      name: 'delete',
      component: () => import('../views/DeleteEventView.vue') 
    },
  ],
})

export default router
