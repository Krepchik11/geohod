<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useEventStore } from '../stores/eventStore'

import Header from '../components/Header.vue'
import ContextMenu from '../components/ContextMenu.vue'
import Toast from '../components/Toast.vue'

const eventStore = useEventStore()
const router = useRouter()

const contextMenuVisible = ref( false )
const contextMenuPosition = ref( { x: 0, y: 0 } )

// const showToast = ref( false )
// const isAndroid = /Android/i.test( navigator.userAgent )

const menuItems = ref([
  { label: 'Копировать ссылку', action: 'copy-link', icon: 'copy-link.svg' },
  { label: 'Копировать', action: 'copy', icon: 'copy.svg' },
  { label: 'Редактировать', action: 'edit', icon: 'edit.svg' },
  { label: 'Участники', action: 'participants', icon: 'people.svg' },
  { label: 'Удалить', action: 'delete', icon: 'delete.svg' },
])


function handleMenuSelect( item ) {
    switch ( item.action ) {
        case 'copy-link':
            copyLink( 'Ссылка скопирована в буфер обмена.' )
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
            // Логика перехода к участникам
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

function copyLink( text ) {
    // if ( window.Telegram?.WebApp ) {
    //     if ( Telegram.WebApp.platform === 'android' ) {
    //         Telegram.WebApp.showAlert( 'Ссылка скопирована в буфер обмена.' )
    //     } else {
    //         showToast.value = true
    //         setTimeout(() => {
    //             showToast.value = false
    //         }, 2000)
    //     }
    // } else {
        // Если Telegram WebApp API недоступно, используем альтернативный метод копирования
        const input = document.createElement( 'input' )
        input.style.position = 'fixed'
        input.style.opacity = '0'
        input.value = text
        document.body.appendChild( input )
        input.select()
        document.execCommand( 'copy' )
        document.body.removeChild( input )

        // showToast.value = true
        // setTimeout(() => {
        //     showToast.value = false
        // }, 2000)
    // }
}


</script>

<template>
    <div class="home">
        <Header>Мои мероприятия</Header>
        <div class="home__section">
            <div 
                v-for="( event, index ) in eventStore.events" 
                :key="index" 
                class="home__event event"
                @click.stop="( e ) => showContextMenu( e, event.id )"
                @touchstart="( e ) => startTouch( e, event.id )"
                @touchend="cancelTouch"
            >
                <!-- <RouterLink class="event__link" :to="{ name: 'registration', params: { id: event.id } }"> -->
                <div class="event__link">
                    <div class="event__inner">
                        <div class="event__image-wrapper">
                            <img 
                                src="/src/assets/geohod_640-360.jpg" 
                                alt="img avatar" 
                                class="event__image"
                            >
                        </div>
                        <div class="event__content">
                            <h3 class="event__title">{{ event.description }}</h3>
                            <div class="event__details">
                               <p class="event__date">{{ formattedDate(event.date) }}</p>
                               <p class="event__participants">{{ event.currentParticipants }}</p>
                            </div>
                        </div>
                    </div>
                </div>    
                <!-- </RouterLink>  -->
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
    }
    &__content {
        width: 80%;
        border-bottom: 0.5px solid var(--primary-gray);
        padding-bottom: 10px;
    }
    &__image-wrapper {
        width: 50px;
        height: 50px;
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
        background-color: var(--primary-gray);
        border-radius: 10px;
    }
    &__details {
        display: flex;
        justify-content: space-between;
    }
    &__date {
        color: var(--primary-gray);
    }
}

</style>
