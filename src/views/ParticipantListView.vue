<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted } from 'vue'

import { get, del } from '../utils/api'
import { useEventStore } from '../stores/eventStore'

import Header from '../components/Header.vue'
import ContextMenu from '../components/ContextMenu.vue'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

onMounted(() => {
  loadEvent()
  loadParticipants()
})

const eventId = computed( () => route.params.id ) 

const description = ref( '' )
const name = ref( '' )
const date = ref( new Date() )
const currentParticipants = ref( 0 )
const maxParticipants = ref( null )

async function loadEvent() {
  try {
    const localEvent = eventStore.events.find( event => event.id === eventId.value )

    if ( localEvent ) {
      name.value = localEvent.description
      description.value = localEvent.description
      date.value = new Date( localEvent.date )
      maxParticipants.value = localEvent.maxParticipants
      currentParticipants.value = localEvent.currentParticipants || 0
    } else {
      const data = await get( `/api/v1/events/${ eventId.value }` )
      if ( !data ) throw new Error( 'Событие не найдено.' )

      name.value = data.description
      description.value = data.description
      date.value = new Date( data.date) 
      maxParticipants.value = data.maxParticipants
      currentParticipants.value = data.currentParticipants || 0
    }
  } catch ( error ) {
    console.error( 'Ошибка загрузки данных мероприятия:', error )
    router.push( '/' )
  }
}

const contextMenuVisible = ref( false )
const contextMenuPosition = ref( { x: 0, y: 0 } )

const menuItems = ref([
  { label: 'Сообщение', action: 'messages', icon: 'messages' },
  { label: 'Удалить', action: 'delete', icon: 'delete' },
])


function handleMenuSelect( item ) {
  switch ( item.action ) {
    case 'messages':
      //отправка сообщения
      break
    case 'delete':
      removeParticipant( contextMenuPosition.value.eventId ) //вот сюда нужно передать participantId
      break
      default:
        console.log( 'Неизвестное действие' )
  }
  closeContextMenu()
}

async function removeParticipant( participantId ) {
  console.log('removeParticipant participantId', participantId);
  try {
    const response = await del( `/api/v1/events/${ eventId.value }/participants/${ participantId }` )
    if ( response.message === 'success' ) {
      participants.value = participants.value.filter( participant => participant.id !== participantId )
      currentParticipants.value -= 1
      console.log( 'Участник успешно удален' )
    } else {
      console.error( 'Не удалось удалить участника' )
    }
  } catch ( error ) {
    console.error( 'Ошибка при удалении участника:', error )
  }
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

function showContextMenu( event, eventId  ) {
  console.log('showContextMenu eventId', eventId);
  

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

  contextMenuPosition.value = { x, y, eventId   }
  contextMenuVisible.value = true

  document.addEventListener( 'click', closeContextMenu )

  console.log('click contextMenuPosition.value',  contextMenuPosition.value);
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
  }).format( new Date( date ) )
}

const participants = ref( [] ) // Хранение списка участников

async function loadParticipants() {
  try {
    const data = await get( `/api/v1/events/${ eventId.value }/participants` )
    if ( !data || !data.participants ) throw new Error( 'Участники не найдены.' )
    participants.value = data.participants

    console.log('participants.value', participants.value)
    
  } catch ( error ) {
    console.error( 'Ошибка загрузки участников:', error )
    participants.value = []
  }
}

</script>

<template>
  <div class="participants-section">
    <Header>Список участников</Header>
    <div class="participants-section__content" v-if="description">
      <h3 class="participants-section__title">{{ description }}</h3>
      <div class="participants-section__details">
        <p class="participants-section__date">{{ formattedDate( date ) }}</p>
      </div>
      <div  
        v-for="( participant, index ) in participants" 
        :key="index"
        class="participants-section__members-list"
        @click.stop="( e ) => showContextMenu( e, participant.id )"
        @touchstart="( e ) => startTouch( e, participant.id )"
        @touchend="cancelTouch"
      >
        <div class="participants-section__member">
          <div class="participants-section__image-wrapper">
            <img 
              :src="participant.imageUrl || '/src/assets/geohod_640-360.jpg'" 
              alt="participant avatar" 
              class="participants-section__image"
            >
          </div>
          <p class="participants-section__member-name">{{ participant.name || participant.username }}</p>
        </div>
        <ContextMenu 
          :visible="contextMenuVisible && contextMenuPosition.eventId === participant.id"
          :position="contextMenuPosition"
          :items="menuItems"
          @select="handleMenuSelect"
          @close="closeContextMenu"
        />
      </div>
      <div class="participants-section__members-quantity">
        <p class="participants-section__members-registered">{{ currentParticipants }}</p>
        из
        <p class="participants-section__members-all">{{ maxParticipants }}</p>
      </div>
    </div>

    <div v-else>
      <p>Мероприятие не найдено</p>
      <button @click="router.push( '/' )">Назад</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.participants-section{
  padding: 0 12px;
  &__content{
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }
  &__title{
    font-size: 24px;
    font-weight: 500;
  }
  &__details{
    display: flex;
    gap: 10px;
  }
  &__date{
    color: var(--primary-blue);
  }
  &__members-list{
    display: flex;
    gap: 10px;
  }
  &__member{
    display: flex;
    gap: 10px;
    align-items: center;
    cursor: pointer;
  }
  &__image-wrapper {
    width: 40px;
    height: 40px;
    overflow: hidden;
    border-radius: 50%;
  }
  &__image{
    width: 100%;
    height: 100%;
    object-fit: cover;  
  }
  &__member-name{
    font-weight: 500;
    font-size: 18px;
  }
  &__members-quantity{
    display: flex;
    justify-content: flex-end;
    gap: 4px;
  }
  &__members-registered{
    color: var(--primary-blue);
  }

}

</style>
