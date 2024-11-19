<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useEventStore } from '../stores/eventStore'
import { MainButton } from 'vue-tg'

import Header from '../components/Header.vue'

const eventStore = useEventStore()
const router = useRouter()
const route = useRoute() 

// Извлекаем ID события из параметров маршрута
const eventId = Number( route.params.id )

// Находим событие по ID
const event = computed(() => {
  return eventStore.getEventById( Number( route.params.id ) ) 
})

function handleRegistration() {
    // router.push( '/creation' )
    console.log( 'Пользователь зарегистрирован на событие:', event.value )
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
               <span class="registration__participants">??</span>
               из
               <span class="registration__participants">{{ event.maxParticipants }}</span>
               
            </div>
        </div>
        <MainButton  text="Зарегистрироваться"  @click="handleRegistration"/>   
    </div>
</template>


<style lang="scss" scoped>
.registration {
    &__title {
        font-weight: 500;
        margin-bottom: 10px;
    }
    &__date {
        margin-bottom: 20px;
    }
    &__section {
        padding: 0 12px;
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
    }
    &__organizer {
        font-weight: 500;
        margin-bottom: 5px;
    }
}

</style>
