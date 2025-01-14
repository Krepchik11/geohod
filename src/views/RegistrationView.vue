<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { get } from '../utils/api'
import { useEventStore } from '../stores/eventStore'
import { MainButton } from 'vue-tg'

import Header from '../components/Header.vue'
import Message from '../components/Message.vue'

const eventStore = useEventStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  loadEvent()
})

const eventId = computed( () => route.params.id ) 

const description = ref( '' )
const name = ref( '' )
const date = ref( new Date() )
const currentParticipants = ref( 0 )
const maxParticipants = ref( null )
const author = ref( '' )

async function loadEvent() {
  try {
    const localEvent = eventStore.events.find( event => event.id === eventId.value )

    if ( localEvent ) {
      name.value = localEvent.description
      description.value = localEvent.description
      date.value = new Date( localEvent.date )
      maxParticipants.value = localEvent.maxParticipants
      currentParticipants.value = localEvent.currentParticipants || 0
      author.value = localEvent.author
    } else {
      const data = await get( `/api/v1/events/${ eventId.value }` )
      if ( !data ) throw new Error( 'Событие не найдено.' )

      name.value = data.description
      description.value = data.description
      date.value = new Date( data.date) 
      maxParticipants.value = data.maxParticipants
      currentParticipants.value = data.currentParticipants || 0
      author.value = data.author
    }
  } catch ( error ) {
    console.error( 'Ошибка загрузки данных мероприятия:', error )
    router.push( '/' )
  }
}

// Находим событие по ID
// const event = computed(() => {
//   return eventStore.getEventById( eventId ) 
// })

const isDisabled = computed( () => eventStore.disabledEventId === eventId )

// function handleRegistration() {  
//     if ( event.value ) {
//       eventStore.incrementParticipants( eventId )
//       eventStore.setDisabledEventId( eventId ) // Блокируем кнопку, сохраняя в хранилище     
//     }
//     setTimeout(() => {
//       router.push( '/' )
//     }, 1000)
// }

function formattedDate( date ) {
  if ( !date ) return ''
  return new Intl.DateTimeFormat( 'ru-RU', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format( new Date( date ) )
}

</script>

<template>
    <div class="registration" v-if="description">
        <Header>Регистрация</Header>
        <div class="registration__section">
            <h3 class="registration__title">{{ description }}</h3>
            <p class="registration__date">{{ formattedDate( date ) }}</p>
            <div class="registration__organizer-details">
                <img 
                    :src="author?.imageUrl"
                    alt="img avatar" 
                    class="registration__organizer-image"
                >
                <div class="registration__organizer-wrapper">
                    <div class="registration__organizer">Организатор:</div>
                    <p class="registration__organizer-name">{{ author.name }}</p>
                </div>
            </div>
            <div class="registration__details">
               Человек в группе:
               <span class="registration__participants registration__participants-now">{{ currentParticipants }}</span>
               из
               <span class="registration__participants">{{ maxParticipants }}</span>
               
            </div>
        </div>
        <Message class="registration__message" v-if="isDisabled">Вы зарегистрированы</Message>
        <Message class="registration__message" v-if="currentParticipants === maxParticipants">Регистрация на мероприятие окончена. Группа набрана.</Message>
        <MainButton 
          text="Зарегистрироваться"  
          @click="handleRegistration" 
          :disabled="isDisabled"
          :visible="currentParticipants !== maxParticipants"
        />
    </div>
</template>


<style lang="scss" scoped>
.registration {
    &__section {
        white-space: normal; 
        overflow-wrap: anywhere; 
        word-break: break-word; 
        padding: 0 12px;
    }
    &__title {
        font-weight: 500;
        margin-bottom: 10px;
    }
    &__date {
        margin-bottom: 20px;
        color: var(--primary-blue);
    }
    &__organizer-details {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
    }
    &__organizer-image {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 20px;
        object-fit: cover;
    }
    &__organizer {
        font-weight: 500;
        margin-bottom: 5px;
    }
    &__participants-now {
        color: var(--primary-blue);
    }
    &__message {
        margin-top: 20px;
    }
}

</style>
