<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useEventStore } from '../stores/eventStore'
import { MainButton } from 'vue-tg'

import Header from '../components/Header.vue'
import Message from '../components/Message.vue'

const eventStore = useEventStore()
const router = useRouter()
const route = useRoute() 

// Извлекаем ID события из параметров маршрута
const eventId = Number( route.params.id )

// Находим событие по ID
const event = computed(() => {
  return eventStore.getEventById( Number( route.params.id ) ) 
})

const isDisabled = computed( () => eventStore.disabledEventId === eventId )

function handleRegistration() {  
    if ( event.value ) {
      eventStore.incrementParticipants( eventId )
      eventStore.setDisabledEventId( eventId ) // Блокируем кнопку, сохраняя в хранилище     
    }
    setTimeout(() => {
      router.push( '/' )
    }, 1000)
}

function formattedDate( date ) {
    if ( !date ) return '' 
    return new Intl.DateTimeFormat( 'ru-RU', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    } ).format( new Date( date ) )
} 

</script>

<template>
    <div class="registration" v-if="event">
        <Header>Регистрация</Header>
        <div class="registration__section">
            <h3 class="registration__title">{{ event.description }}</h3>
            <p class="registration__date">{{ formattedDate( event.date ) }}</p>
            <div class="registration__organizer-details">
                <img 
                    src="/src/assets/geohod_640-360.jpg" 
                    alt="img avatar" 
                    class="registration__organizer-image"
                >
                <div class="registration__organizer-wrapper">
                    <div class="registration__organizer">Организатор:</div>
                    <p class="registration__organizer-name">Иванов Иван ???</p>
                </div>
            </div>
            <div class="registration__details">
               Человек в группе:
               <span class="registration__participants registration__participants-now">{{ event.currentParticipants }}</span>
               из
               <span class="registration__participants">{{ event.maxParticipants }}</span>
               
            </div>
        </div>
        <Message class="registration__message" v-if="isDisabled">Вы зарегистрированы</Message>
        <Message class="registration__message" v-if="event.currentParticipants === event.maxParticipants">Регистрация на мероприятие окончена. Группа набрана.</Message>
        <MainButton 
          text="Зарегистрироваться"  
          @click="handleRegistration" 
          :disabled="isDisabled"
          :visible="event.currentParticipants !== event.maxParticipants"
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
