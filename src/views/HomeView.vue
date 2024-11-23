<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useEventStore } from '../stores/eventStore'
import { MainButton } from 'vue-tg'


import Header from '../components/Header.vue'

const eventStore = useEventStore()
const router = useRouter()

function handleCreata() {
    router.push( '/creation' )
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
    <div class="home">
        <Header>Мои мероприятия</Header>
        <div class="home__section">
            <div 
                v-for="(event, index) in eventStore.events" 
                :key="index" 
                class="home__event event"
            >
                <RouterLink :to="{ name: 'registration', params: { id: event.id } }">
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
                        <hr class="event__divider">
                    </div>
                </RouterLink> 
            </div>
        </div>
        <div class="home__btn-wrapper">
            <RouterLink to="/creation">
                <button class="home__btn-create">
                    <svg class="home__btn-icon" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="24px" height="24px" fill="currentColor">
                        <path d="M 11 2 L 11 11 L 2 11 L 2 13 L 11 13 L 11 22 L 13 22 L 13 13 L 22 13 L 22 11 L 13 11 L 13 2 Z"/>
                    </svg>
                </button>
                <!-- <MainButton  text="Создать мероприятие"  @click="handleCreata"/>    -->
            </RouterLink>
        </div>

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
    &__image-wrapper {
        width: 50px;
        height: 50px;
        overflow: hidden;
        border-radius: 50%;
        margin-right: 20px;
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
        background-color: #007bff;
        border-radius: 50%;
    }
}
</style>
