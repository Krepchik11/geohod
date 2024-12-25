<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { MainButton } from 'vue-tg'
import { deleteRequest } from '../utils/api'

import Header from '../components/Header.vue'
import { useEventStore } from '../stores/eventStore'
import Message from '../components/Message.vue'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()
const isLoading = ref( false )

const eventId = computed( () => route.params.id )

const selectedEvent = computed(() =>
  eventStore.events.find( event => event.id === eventId.value ) 
)

function formattedDate( date ) {
  if ( !date ) return ''
  return new Intl.DateTimeFormat( 'ru-RU', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
  }).format( new Date( date ) )
}

// async function loadEvent() {
//   try {
//     if ( !eventId.value ) throw new Error( 'ID мероприятия отсутствует.' )

//     const localEvent = eventStore.events.find( event => event.id === eventId.value )

//     if ( localEvent ) {
//       name.value = localEvent.description
//       description.value = localEvent.description
//       date.value = new Date( localEvent.date )
//       maxParticipants.value = localEvent.maxParticipants
//       currentParticipants.value = localEvent.currentParticipants || 0
//     } else {
//       const data = await get( `/api/v1/events/${ eventId.value }` )
//       if ( !data ) throw new Error( 'Событие не найдено.' )

//       name.value = data.description
//       description.value = data.description
//       date.value = new Date( data.date) 
//       maxParticipants.value = data.maxParticipants
//       currentParticipants.value = data.currentParticipants || 0
//     }
//   } catch ( error ) {
//     console.error( 'Ошибка загрузки данных мероприятия:', error )
//     router.push( '/' )
//   }
// }

async function deleteEvent() {
  try {
    await deleteRequest( `/api/v1/events/${ eventId.value }/cancel` )
    await eventStore.fetchEvents()
    router.push( '/' )
  } catch ( error ) {
    console.error( 'Ошибка при удалении мероприятия:', error )
  } finally {
    isLoading.value = false
  }
}

// loadEvent()

</script>

<template>
  <div class="delete-section">
    <Header>Удаление мероприятия</Header>
    <div class="delete-section__content" v-if="selectedEvent">
      <h3 class="delete-section__title">{{ selectedEvent.description }}</h3>
      <div class="delete-section__details">
        <p class="delete-section__date">{{ formattedDate( selectedEvent.date ) }}</p>
      </div>
      <div class="delete-section__members-list"></div>
      <div class="delete-section__members-quantity">
        <p class="delete-section__members-registered">{{ selectedEvent.currentParticipants }}</p>
        из
        <p class="delete-section__members-all">{{ selectedEvent.maxParticipants }}</p>
      </div>
      <Message v-if="0 < selectedEvent.currentParticipants">На мероприятие записаны люди!</Message>
      <MainButton text="Удалить" @click="deleteEvent" />
    </div>

    <div v-else>
      <p>Мероприятие не найдено</p>
      <MainButton text="Назад" @click="router.push( '/' )" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.delete-section{
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
