<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useEventStore } from '../stores/eventStore'
import { get, del } from '../utils/api'

import Header from '../components/Header.vue'
import ContextMenu from '../components/ContextMenu.vue'

const eventStore = useEventStore()
const router = useRouter()

const isLoading = ref( true )

const registeredEvents = computed( () => eventStore.registeredEvents )

onMounted( async () => {
  try {
    await eventStore.fetchEvents()
    isLoading.value = false
  } catch ( error ) {
    console.error( 'Error fetching events on mount:', error )
  }
})

const initData = window.Telegram.WebApp.initData

const decodedInitData = decodeURIComponent( initData )

const params = new URLSearchParams( decodedInitData )
const userParam = params.get( 'user' )

let extractedUsername = null

if ( userParam ) {
  const user = JSON.parse( userParam )
  const username = user.username; 
  extractedUsername = username
} else {
  console.log('User parameter not found in initData.')
}

const contextMenuVisible = ref( false )
const contextMenuPosition = ref( { x: 0, y: 0 } )

const menuItems = ref([
  { label: 'Копировать ссылку', action: 'copy-link', icon: 'copy-link' },
  { label: 'Копировать', action: 'copy', icon: 'copy' },
  { label: 'Редактировать', action: 'edit', icon: 'edit' },
  { label: 'Участники', action: 'participants', icon: 'people' },
  { label: 'Отменить', action: 'delete', icon: 'delete' },
])

function handleMenuSelect( item ) {
    switch ( item.action ) {
        case 'copy-link':
            copyLink()
            break
        case 'copy':
            const eventToCopy = eventStore.events.find( event => event.id === contextMenuPosition.value.eventId )
            if ( eventToCopy ) {
                router.push({
                    name: 'createEvent',
                    query: {
                        description: eventToCopy.description,
                        date: eventToCopy.date,
                        maxParticipants: eventToCopy.maxParticipants,
                    }
                });
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

let touchTimer = null
let isLongPress = false

function startTouch( event, eventId ) {
    isLongPress = false

    touchTimer = setTimeout(() => {
        isLongPress = true
        showContextMenu( event.touches[ 0 ], eventId )
    }, 600)

    event.target.addEventListener( 'touchmove', cancelTouch, { passive: false } )
    event.target.addEventListener( 'touchcancel', cancelTouch, { passive: false } )
}

function cancelTouch( event ) {
    clearTimeout( touchTimer )
    if ( isLongPress ) {
        event.preventDefault()
        event.stopPropagation()
    }
    event.target.removeEventListener( 'touchmove', cancelTouch )
}

function showContextMenu( event, eventId ) {
    const selectedEvent = eventStore.events.find( e => e.id === eventId )
    
    if ( !selectedEvent ) {
      console.error( 'Event not found:', eventId )
      return;
    }

    // Проверяем, является ли пользователь автором
    const isAuthor = Boolean( selectedEvent.author.username === extractedUsername )   
  
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

    event.preventDefault()

    const menuWidth = 200
    const menuHeight = 150
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let x = event.clientX
    let y = event.clientY
    if ( x + menuWidth > windowWidth ) {
        x = windowWidth - menuWidth - 10
    }
    if ( y + menuHeight > windowHeight ) {
        if ( y - menuHeight > 0 ) {
            y = y - menuHeight - 10
        } else {
            y = windowHeight - menuHeight - 10
        }
    }

    contextMenuPosition.value = { x, y, eventId }
    contextMenuVisible.value = true

    document.addEventListener( 'click', closeContextMenu )
}

function closeContextMenu() {
    contextMenuVisible.value = false
    document.removeEventListener( 'click', closeContextMenu )
}

function formattedDate( date ) {
    if ( !date ) return '' 
    return new Intl.DateTimeFormat( 'ru-RU', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    } ).format( new Date( date ) )
} 

async function copyLink() {
   const eventId = contextMenuPosition.value.eventId
 
   if ( !eventId ) {
      console.error( 'Event ID отсутствует' )
      return
    }
 
   try {
       const botName = 'weorganize_bot'
       const eventLink = `https://t.me/${ botName }/act?startapp=registration_${ eventId }`

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

function isEventFinished( eventDate ) {
  if ( !eventDate ) return false
  return new Date( eventDate ) < new Date()
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
    
    const event = eventStore.events.find( e => e.id === eventId )
    
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

function isEventAuthor( event ) {
  return event.author?.username === extractedUsername
}


</script>

<template>
    <div class="home">
        <Header>Мои мероприятия</Header>
        <div v-if="isLoading">Загрузка...</div>
        <div class="home__section">
            <div 
                v-for="( event, index ) in eventStore.events" 
                :key="index" 
                class="home__event event"
                @click.stop="( e ) => showContextMenu( e, event.id )"
                @touchstart="( e ) => startTouch( e, event.id )"
                @touchend="cancelTouch"
            >
                <div class="event__link">
                    <div class="event__inner">
                        <div class="event__image-wrapper">
                            <img 
                                :src="event.author?.imageUrl || '/src/assets/geohod_640-360.jpg'"
                                alt="img avatar" 
                                class="event__image"
                            >
                        </div>
                        <div class="event__content">
                            <h3 class="event__title">{{ event.description }}</h3>
                            <div class="event__details">
                               <p class="event__date">{{ formattedDate( event.date ) }}</p>
                               <p class="event__participants">{{ event.currentParticipants }}</p>
                            </div>
                            <div class="event__finish">
                                <RouterLink
                                v-if="isEventFinished( event.date ) && isEventAuthor( event )"
                                :to="{ name: 'finish', params: { id: event.id } }"
                                class="event__finish-link"
                              >
                                Завершить
                              </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>    
                <ContextMenu 
                    :visible="contextMenuVisible && contextMenuPosition.eventId === event.id"
                    :position="contextMenuPosition"
                    :items="menuItems"
                    @select="handleMenuSelect"
                    @close="closeContextMenu"
               />
            </div>
        </div>
        <div class="home__btn-wrapper">
            <RouterLink to="/create">
                <button class="home__btn-create">
                    <svg class="home__btn-icon" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="24px" height="24px" fill="currentColor">
                        <path d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"/>
                    </svg>
                </button>
            </RouterLink>
        </div>
        <!-- <Toast :visible="showToast">Скопировано в буфер обмена</Toast> -->
    </div>
</template>


<style lang="scss" scoped>
.home {
  position: relative;
  &__section {
    padding: 0 12px 100px 12px;
  }
  &__btn-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 100px;   
  }
  &__btn-create {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: var(--primary-blue);
    border: none;
    cursor: pointer;
    margin-right: 20px;
  }
  &__btn-icon {
    color: white;
  }
}

.event {
  display: flex;
  white-space: normal; 
  overflow-wrap: anywhere; 
  word-break: break-word;
  &__link {
    width: 100%;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }
  &__inner {
    display: flex;
    gap: 10px;
    align-items: center;
    padding-bottom: 10px;
  } 
  &__title {
    padding-bottom: 5px;
    font-size: 1em;
    line-height: 1.375rem;
    font-weight: 500;
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis;
    max-width: 100%;
  }
  &__content {
    width: 80%;
    border-bottom: 0.5px solid var(--primary-gray);
    padding-bottom: 10px;
  }
  &__image-wrapper {
    width: 54px;
    height: 54px;
    overflow: hidden;
    border-radius: 50%;
  }
  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  &__participants {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 20px;
    background-color: #aaaaaa;
    color: #ffffff;
    border-radius: 10px;
  }
  &__details {
    display: flex;
    justify-content: space-between;
  }
  &__date {
    color: var(--primary-gray);
    font-size: 1em;
    line-height: 1.375rem;
  }
  &__finish {
    display: flex;
    justify-content: flex-end;
  }
  &__finish-link {
    display: flex;
    color: var(--primary-blue);
    text-decoration: none;
    font-weight: 500;
    padding-top: 10px;
    padding-right: 12px;
    max-width: 100px;
  }
}

</style>
