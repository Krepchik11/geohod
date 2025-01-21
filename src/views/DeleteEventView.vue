<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { MainButton } from 'vue-tg'
import { get, patch } from '../utils/api'

import Header from '../components/Header.vue'
import { useEventStore } from '../stores/eventStore'
import Message from '../components/Message.vue'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const isLoading = ref( false )

const eventId = computed( () => route.params.id )

const name = ref( '' )
const description = ref( '' )
const date = ref( new Date() )
const currentParticipants = ref( 0 )
const maxParticipants = ref( null )

const participants = ref( [] )

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

function formattedDate( date ) {
  if ( !date ) return ''
  return new Intl.DateTimeFormat( 'ru-RU', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
  }).format( new Date( date ) )
}

async function loadEvent() {
  try {
    if ( !eventId.value ) throw new Error( 'ID мероприятия отсутствует.' )

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

async function cancelEvent() {
  try {
    await patch( `/api/v1/events/${ eventId.value }/cancel` )
    await eventStore.fetchEvents()
    router.push( '/' )
  } catch ( error ) {
    console.error( 'Ошибка при удалении мероприятия:', error )
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadEvent()
  loadParticipants()
})

</script>

<template>
  <div class="cancel-section">
    <Header>Отмена мероприятия</Header>
    <div class="cancel-section__content" v-if="name">
      <h3 class="cancel-section__title">{{ name }}</h3>
      <div class="cancel-section__details">
        <p class="cancel-section__date">{{ formattedDate( date ) }}</p>
      </div>
      <div  
        v-for="( participant, index ) in participants" 
        :key="index"
        class="cancel-section__members-list"
      >
        <div class="cancel-section__member">
          <div class="cancel-section__image-wrapper">
            <img 
              :src="participant.imageUrl || '/src/assets/geohod_640-360.jpg'" 
              alt="participant avatar" 
              class="cancel-section__image"
            >
          </div>
          <p class="cancel-section__member-name">{{ participant.name || participant.username }}</p>
        </div>
      </div>
      <div class="cancel-section__members-quantity">
        <p class="cancel-section__members-registered">{{ currentParticipants }}</p>
        из
        <p class="cancel-section__members-all">{{ maxParticipants }}</p>
      </div>
      <Message v-if="currentParticipants > 0">На мероприятие записаны люди!</Message>
      <MainButton text="Отменить" @click="cancelEvent" />
    </div>

    <div v-else>
      <p>Мероприятие не найдено</p>
      <MainButton text="Назад" @click="router.push( '/' )" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cancel-section{
  padding: 0 12px;
  &__content{
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }
  &__title{
    font-size: 1em;
    line-height: 1.375rem; 
    font-weight: 500;
  }
  &__details{
    display: flex;
    gap: 10px;
  }
  &__date{
    color: var(--primary-blue);
  }
  &__members-quantity{
    display: flex;
    justify-content: flex-end;
    gap: 4px;
  }
  &__members-registered{
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
    width: 54px;
    height: 54px;
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

}

</style>
