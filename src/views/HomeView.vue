<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore'
import { del } from '../utils/api'
import { useContextMenu } from '../composables/useContextMenu'

import Header from '../components/Header.vue'
import ContextMenu from '../components/ContextMenu.vue'
import EventCard from '../components/EventCard.vue'

const botId = import.meta.env.VITE_BOT_ID
const botName = import.meta.env.VITE_BOT_NAME

const eventStore = useEventStore()
const router = useRouter()
const isLoading = ref(true)
const isWriteAccessRequested = ref(false)

const {
  contextMenuVisible,
  contextMenuPosition,
  showContextMenu,
  closeContextMenu,
  startTouch,
  cancelTouch
} = useContextMenu()

// Extract user ID from Telegram init data
const extractedId = (() => {
  const initData = window.Telegram.WebApp.initData
  const params = new URLSearchParams(decodeURIComponent(initData))
  const userParam = params.get('user')
  return userParam ? JSON.parse(userParam).id : null
})()

const menuItems = ref([])

onMounted(async () => {
  try {
    if (!window.Telegram.WebApp.initDataUnsafe.write_access && !isWriteAccessRequested.value) {
      isWriteAccessRequested.value = true
      Telegram.WebApp.requestWriteAccess({
        write_access_purpose: 'access_purpose',
        bot_id: botId,
      })
    }

    await eventStore.fetchEvents()
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    isLoading.value = false
  }
})

function updateMenuItems(eventId) {
  const selectedEvent = eventStore.events.find(e => e.id == eventId)
  if (!selectedEvent) return

  const isAuthor = selectedEvent.author.id == extractedId

  menuItems.value = isAuthor
    ? [
        { label: 'Копировать ссылку', action: 'copy-link', icon: 'copy-link' },
        { label: 'Копировать', action: 'copy', icon: 'copy' },
        { label: 'Редактировать', action: 'edit', icon: 'edit' },
        { label: 'Участники', action: 'participants', icon: 'people' },
        { label: 'Отменить', action: 'delete', icon: 'delete' },
      ]
    : [
        { label: 'Сообщение', action: 'messages', icon: 'messages' },
        { label: 'Отменить', action: 'cancel', icon: 'delete' },
      ]
}

function handleMenuSelect( item ) {
  switch ( item.action ) {
    case 'copy-link':
      copyLink()
      break
    case 'copy':
      const eventToCopy = eventStore.events.find( event => event.id == contextMenuPosition.value.eventId )
      if ( eventToCopy ) {
        router.push({
            name: 'createEvent',
            query: {
                description: eventToCopy.description,
                date: eventToCopy.date,
                maxParticipants: eventToCopy.maxParticipants,
            }
        })
      }
      break
    case 'edit':
      router.push({ name: 'edit', params: { id: contextMenuPosition.value.eventId } })
      break
    case 'participants':
      router.push({ name: 'participants', params: { id: contextMenuPosition.value.eventId } })
      break
    case 'delete':
      router.push( { name: 'delete', params: { id: contextMenuPosition.value.eventId } } )
      break
    case 'cancel':
      cancelRegistration()
      break 
    case 'messages':
      sendMessageToAuthor()
      break       
    default:
      console.log( 'Неизвестное действие' )
  }
  closeContextMenu()
}

async function copyLink() {
  const eventId = contextMenuPosition.value.eventId

  if ( !eventId ) {
     console.error( 'Event ID отсутствует' )
     return
   }

  try {
     const eventLink = `https://t.me/${ botName }/app?startapp=registration_${ eventId }`
    if ( navigator.clipboard && window.isSecureContext ) {
      await navigator.clipboard.writeText( eventLink )
      showSuccessToast( 'Ссылка скопирована в буфер обмена.' )
    } else {
      copyTextToClipboard( eventLink )
      showSuccessToast( 'Ссылка скопирована в буфер обмена.' )
    }
  } catch ( error ) {
    console.error( 'Ошибка копирования ссылки:', error )
    showErrorToast( 'Не удалось скопировать ссылку.' )
  }

} 

function copyTextToClipboard( text ) {
  const textArea = document.createElement( 'textarea' )
  textArea.value = text
  textArea.style.position = 'fixed'
  document.body.appendChild( textArea )
  textArea.focus()
  textArea.select()
  try {
    document.execCommand( 'copy' )
  } catch ( error ) {
    console.error( 'Ошибка при использовании execCommand:', error )
  }
  document.body.removeChild( textArea )
}

function showSuccessToast( message ) {
  if ( window.Telegram?.WebApp ) {
    Telegram.WebApp.showAlert( message )
  } else {
    alert( message ) 
  }
}

function showErrorToast( message ) {
  if ( window.Telegram?.WebApp ) {
    Telegram.WebApp.showAlert ( message )
  } else {
    alert( message )
  }
}

async function cancelRegistration() {
  const eventId = contextMenuPosition.value.eventId

  if (!eventId) {
    console.error('Event ID отсутствует')
    return
  }

  try {
    await del( `/api/v1/events/${ eventId }/unregister` )

    eventStore.events = eventStore.events.filter(
      ( event ) => event.id !== eventId
    )

    await eventStore.fetchEvents()
  } catch ( error ) {
    console.error( 'Ошибка при отмене регистрации:', error )
    showErrorToast( 'Не удалось отменить участие. Пожалуйста, попробуйте еще раз.' )
  }
}

function sendMessageToAuthor( ) {
    const eventId = contextMenuPosition.value.eventId

    if ( !eventId ) {
      console.error( 'Event ID отсутствует' )
      return
    }
    
    const event = eventStore.events.find( e => e.id == eventId )
    
    if ( !event ) {
      console.error( 'Мероприятие не найдено' )
      return
    }
    
    const authorUsername = event.author?.username
    
    if ( !authorUsername ) {
      console.error( 'Автор мероприятия отсутствует или у него нет username' )
      return
    }
    
    const telegramUrl = `https://t.me/${ authorUsername }`
    window.open( telegramUrl, '_blank' )
}

</script>

<template>
  <div class="home">
    <Header>Мои мероприятия</Header>
    
    <div v-if="isLoading" class="loading">Загрузка...</div>
    
    <div v-else class="home__section">
      <EventCard
        v-for="event in eventStore.events"
        :key="event.id"
        :event="event"
        :is-author="event.author?.id == extractedId"
        @show-context-menu="showContextMenu"
        @touch-start="startTouch"
        @touch-end="cancelTouch"
      />
      
      <ContextMenu 
        :visible="contextMenuVisible"
        :position="contextMenuPosition"
        :items="menuItems"
        @select="handleMenuSelect"
        @close="closeContextMenu"
      />
    </div>

    <RouterLink to="/create" class="fab">
      <svg class="icon-plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="currentColor">
        <path d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"/>
      </svg>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.home {
  position: relative;
  min-height: 100vh;
  
  &__section {
    padding: 0 16px 100px;
  }
}

.loading {
  text-align: center;
  padding: 20px;
}

.fab {
  position: fixed;
  bottom: 64px;
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-blue);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  text-decoration: none;
  
  .icon-plus {
    width: 24px;
    height: 24px;
  }
}
</style>
