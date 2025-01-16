<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useEventStore } from '../stores/eventStore'
import { get } from '../utils/api'

import Header from '../components/Header.vue'
import ContextMenu from '../components/ContextMenu.vue'

const eventStore = useEventStore()
const router = useRouter()

const isLoading = ref( true )

const registeredEvents = computed( () => eventStore.registeredEvents )

console.log('registeredEvents', registeredEvents)


onMounted( async () => {
  try {
    await eventStore.fetchEvents()
    isLoading.value = false
  } catch ( error ) {
    console.error( 'Error fetching events on mount:', error )
  }
})

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
    if (!eventId) {
      console.error('Invalid eventId:', eventId);
      return;
    }

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

       console.log('Event link:', eventLink)

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
                                v-if="isEventFinished( event.date )"
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
               <img src="/src/assets/copy-link.svg" alt="img">
               <img src="/src/assets/copy.svg" alt="img">
               <img src="/src/assets/edit.svg" alt="img">
               <img src="/src/assets/people.svg" alt="img">
               <img src="/src/assets/delete.svg" alt="img">

               <div class="svg">
                <svg fill="currentColor" height="141.732" width="141.732" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M99.803.169c-3.678.512-8.524 2.654-11.575 5.118-1.039.839-10.516 10.171-21.059 20.737C46.878 46.359 46.501 46.775 44.77 50.671c-1.717 3.867-2.476 8.53-2.022 12.433.294 2.526 1.05 5.454 1.907 7.38l.513 1.154 3.814-3.808 3.813-3.808-.079-2.431c-.12-3.687.63-6.067 2.922-9.268.557-.78 9.554-9.924 19.991-20.322 20.304-20.225 20.148-20.085 23.572-21.148 6.583-2.044 13.693.979 16.806 7.145 1.014 2.009 1.413 3.795 1.413 6.333 0 2.656-.416 4.402-1.599 6.71-.793 1.546-2.399 3.216-20.84 21.668-19.364 19.374-20.036 20.018-21.753 20.842-2.597 1.248-4.196 1.596-7.04 1.533l-2.434-.053-3.775 3.764-3.775 3.764 1.13.518c.622.284 2.087.811 3.256 1.169 1.988.61 2.404.652 6.378.65 4.695-.003 6.057-.251 9.714-1.774 4.055-1.688 4.384-1.987 26.098-23.756 21.713-21.768 21.406-21.428 23.132-25.593 1.105-2.668 1.657-5.23 1.805-8.379.16-3.42-.248-6.115-1.425-9.409-2.794-7.818-9.767-13.844-17.98-15.539-2.008-.414-6.475-.56-8.509-.277M69.449 56.665c-2.734.602-5.4 1.67-7.798 3.125-1.805 1.095-4.03 3.237-22.279 21.442-17.284 17.242-20.48 20.535-21.671 22.329-3.947 5.947-5.042 13.74-2.889 20.567 1.838 5.827 5.701 10.677 11.054 13.877 3.292 1.968 6.979 3.024 11.164 3.198 5.944.247 11.167-1.364 15.791-4.873 1.08-.819 10.024-9.592 21.27-20.86 16.643-16.678 19.595-19.738 20.731-21.494 3.144-4.862 4.58-10.678 3.939-15.955-.279-2.291-1.075-5.328-1.904-7.259l-.501-1.168-3.991 3.985-3.99 3.985.136 1.922c.182 2.582-.235 4.772-1.373 7.207l-.938 2.008-19.847 19.86c-13.502 13.511-20.259 20.11-21.134 20.641-3.187 1.931-7.408 2.643-10.732 1.808-6.118-1.536-10.312-6.486-10.767-12.708-.188-2.563.3-4.886 1.578-7.515l.976-2.008L46.267 88.8c19.192-19.179 20.064-20.015 21.764-20.852 2.388-1.174 4.763-1.654 7.332-1.482l2.017.136 3.965-3.971 3.966-3.971-1.455-.631c-2.827-1.226-4.797-1.612-8.738-1.712-2.959-.076-4.047-.009-5.669.348" fill-rule="evenodd"/></svg>
                <svg height="512" width="512" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"><path d="M159.573 43.947v38.826H43.52V506.88H352.427v-76.8H468.48V101.968l-48.429-48.424-48.43-48.424H159.573v38.827M352.427 72.96v48.213h96.426v289.28h-96.426V178.779l-47.998-48.003-47.997-48.003H179.2V24.747h173.227V72.96m54.186-5.547 34.126 34.134h-68.686V67.413c0-18.773.098-34.133.218-34.133.119 0 15.573 15.36 34.342 34.133m-170.24 82.347v48.213h97.28v290.134H63.147v-386.56h173.226v48.213m87.894 28.806c0 .359-15.264.553-33.92.43l-33.92-.223-.222-34.56-.221-34.56 34.141 34.13c18.778 18.771 34.142 34.423 34.142 34.783" fill="currentColor" fill-rule="evenodd"/></svg>
               </div>
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
    }
    &__content {
        width: 80%;
        border-bottom: 0.5px solid var(--primary-gray);
        padding-bottom: 10px;
    }
    &__image-wrapper {
        width: 40px;
        height: 40px;
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
