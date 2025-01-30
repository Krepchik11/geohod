<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { get, post } from '../utils/api'
import { useEventStore } from '../stores/eventStore'
import { MainButton } from 'vue-tg'

import Header from '../components/Header.vue'
import Message from '../components/Message.vue'

const eventStore = useEventStore()
const router = useRouter()
const route = useRoute()

// const isAgreementEnabled = ref( true )

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
const author = ref( '' )

const participants = ref( [] )
const isRegistred = ref( false )  

const initData = window.Telegram.WebApp.initData

const decodedInitData = decodeURIComponent( initData )

const params = new URLSearchParams( decodedInitData )
const userParam = params.get( 'user' )

let extractedId = null

if ( userParam ) {
  try {
    const user = JSON.parse( userParam )
    extractedId = user.id 
  } catch (error) {
    console.error( 'Ошибка парсинга userParam:', error )
  }
} 

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

const isDisabled = computed( () => {
  return eventStore.registeredEventIds.includes( eventId.value )
})

async function handleRegistration() {
  try {
    await post( `/api/v1/events/${ eventId.value }/register` )
    .then( () => {
      currentParticipants.value += 1
      eventStore.setDisabledEventId( eventId.value )
      eventStore.registerForEvent( eventId.value )     
      eventStore.fetchEvents() 
      router.push( '/' ) 
    })
    .catch( error => {
      console.error( 'Failed to registration:', error )
    })
  } catch (error) {
    console.error( 'Ошибка регистрации:', error )
  }
}

async function loadParticipants() {
  try {
    const data = await get( `/api/v1/events/${ eventId.value }/participants` )
    if ( !data || !data.participants ) throw new Error( 'Участники не найдены.' )

    participants.value = data.participants

    isRegistred.value = extractedId 
    ? participants.value.some( participant => participant.id === extractedId )
    : false
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
        <Message class="registration__message" v-if="isRegistred">Вы зарегистрированы</Message>
        <Message class="registration__message" v-if="currentParticipants === maxParticipants">Регистрация на мероприятие окончена. Группа набрана.</Message>
        <!-- <div class="registration__agreement" v-if="currentParticipants !== maxParticipants">
          <label class="registration__agreement-lable">
            <input
              type="checkbox"
              v-model="isAgreementEnabled"
            />
            <div class="registration__agreement-content">
              <p class="registration__agreement-text">Я прочитал(а) и принимаю</p>
              <a class="registration__agreement-link" href="#">Пользовательское соглашение</a>
            </div>
          </label>
        </div> -->
        <MainButton 
          text="Зарегистрироваться"  
          @click="handleRegistration" 
          :disabled="isDisabled || currentParticipants === maxParticipants"
          :visible="currentParticipants !== maxParticipants"
        />
        <!-- :disabled="!isAgreementEnabled || isDisabled || currentParticipants === maxParticipants" -->
    </div>
</template>


<style lang="scss" scoped>
.registration {
  &__section {
    white-space: normal; 
    overflow-wrap: anywhere; 
    word-break: break-word; 
    padding: 0 18px;
  }
  &__title {
    font-size: 1em;
    line-height: 1.375rem; 
    font-weight: 500;
    margin-bottom: 20px;
  }
  &__date {
    margin-bottom: 20px;
    color: var(--primary-blue);
  }
  &__organizer-details {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }
  &__organizer-image {
    width: 54px;
    height: 54px;
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
  &__agreement {
    padding-top: 20px;
  }
  &__agreement-lable {
    padding: 12px;
    display: flex;
    gap: 20px;
  }
  &__agreement-content {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  &__agreement-link{
    text-decoration: none;
    color: var(--primary-blue);
  }
}

</style>
