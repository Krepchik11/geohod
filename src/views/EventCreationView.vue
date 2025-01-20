<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter, useRoute  } from "vue-router"
import { useWebAppTheme } from 'vue-tg'
import { useEventStore } from '../stores/eventStore.js'
import { post } from '../utils/api'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ru } from 'date-fns/locale'

import CustomInput  from '../components/CustomInput.vue'
import Header from '../components/Header.vue'

const eventStore = useEventStore()
const router = useRouter()
const route = useRoute()

const theme = useWebAppTheme()

const dataPickerTheme = ref( theme.colorScheme.value === 'dark' ? true : false )

const description = ref( route.query.description || '' )
const date = ref( new Date( Date.now() ) )
const maxParticipants = ref( route.query.maxParticipants || '30' )
const currentParticipants = ref( 0 )
const maxParticipantsPlaceholder = ref( '30' )

const childInput = ref( null )
const isInputBlurred = ref( false )
const isEditing = ref( false )

const isNewEvent = computed( () => !route.query.description )

const isButtonsVisible = ref( true )

function createEvent() {
  if ( !description.value || !date.value || !maxParticipants.value ) return 

  const newEvent = {
    name: description.value,
    description: description.value,
    date: date.value.toISOString(),
    maxParticipants: maxParticipants.value,
  }

  post( '/api/v1/events', newEvent ) 
  .then( response => {
    console.log( 'Event created:', response )
    eventStore.fetchEvents() 
    router.push( '/' ) 
  })
  .catch( error => {
    console.error( 'Failed to create event:', error )
    alert( 'Произошла ошибка при создании события. Пожалуйста, попробуйте снова.' )
  })
}

function cancel() {
  router.push( '/' )
}

function showPreview() {
 return description.value && isInputBlurred.value
}

function editPreview() {
  isEditing.value = true
  nextTick(() => {
    focusInput()
  });
}

function blurInput() {
  isInputBlurred.value = true
  isEditing.value = false
  isButtonsVisible.value = true
}

function focusInput() {
  isInputBlurred.value = false
  childInput.value.focusInput()
  isButtonsVisible.value = false
}

function focusMaxParticipants() {
  maxParticipants.value = ''
  maxParticipantsPlaceholder.value = ''
  nextTick(() => {
    const inputElement = document.querySelector('.event-creation__input-max-participants input')
    if ( inputElement ) {
      inputElement.value = ''
    }
  })
  isButtonsVisible.value = false
}

function blurMaxParticipantst() {
  if (!maxParticipants.value) {
    maxParticipants.value = '30'
    maxParticipantsPlaceholder.value = '30'
  }
  isButtonsVisible.value = true
}

function validateMaxParticipants( event ) {
  const input = event.target.value
  if  (input.length > 2 ) {
    maxParticipants.value = input.slice( 0, 2 )
  }
}

function handleKeyDown( event ) {
  if ( event.key === 'Enter' || event.code === 'Enter') {
    blurMaxParticipantst()
    blurInput()
    event.target.blur()
    event.preventDefault()
  }
}


function formattedDate( date ) {
  if ( !date ) return '' 
  return new Intl.DateTimeFormat( 'ru-RU', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
  } ).format( new Date( date ) )
} 

onMounted(() => {
  nextTick(() => {
    if (isNewEvent.value) {
      childInput.value.focusInput() // Устанавливаем фокус на первый инпут при активации компонента, если это новое событие
    } else {
      isInputBlurred.value = true
    }
  })
})

</script>

<template>
  <div class="event-creation">
    <Header>Создание мероприятия</Header>
    <div class="event-creation__section">
      <div 
        v-if="showPreview()  && !isEditing" 
        class="event-creation__preview" 
        @click="editPreview"
      >
        <div class="event-creation__image-wrapper">
          <img 
            src="/src/assets/geohod_640-360.jpg" 
            alt="img avatar" 
            class="event-creation__image"
          >
        </div>
        <div class="event-creation__content">
          <h3 class="event-creation__title">{{ description }}</h3>
          <div class="event-creation__details">
             <p class="event-creation__date">{{ formattedDate( date ) }}</p>
          </div>
        </div>
      </div>
      <CustomInput
        v-else
        ref="childInput"
        v-model="description" 
        :maxLength="62" 
        :showLabel="true"
        label="Название" 
        placeholder="Введите название"
        @blur="blurInput"
        @focus="focusInput"        
        @keydown="handleKeyDown"
      />
      <div class="event-creation__datepicker-wrapper">
        <div class="event-creation__label">Дата</div>
        <div class="event-creation__datepicker">
            <VueDatePicker
              v-model="date" 
              :dark="dataPickerTheme" 
              inline
              auto-apply
              locale="ru"
              :enableTimePicker="false" 
            ></VueDatePicker>
        </div>
      </div>
      <div class="event-creation__input-wrapper">
        <div class="event-creation__label">Максимум участников</div>
        <div class="event-creation__input-max-participants">
          <CustomInput
            ref="maxParticipantsInput"
            v-model="maxParticipants"
            :maxLength="99"
            :acceptNumbersOnly="true"
            :showLabel="false"
            label="Максимум участников"
            :placeholder="maxParticipantsPlaceholder"
            @blur="blurMaxParticipantst"
            @focus="focusMaxParticipants"  
            @input="validateMaxParticipants"
            @keydown="handleKeyDown"
          />
        </div>
      </div>
      <div 
        class="event-creation__buttons-block"
        v-if="isButtonsVisible"
        >
        <button 
          class="event-creation__button event-creation__button--cancel"
          @click="cancel"
        >
          Отмена
        </button>
        <button 
          class="event-creation__button event-creation__button--confirm"
          @click="createEvent" 
        >
          Ок
        </button>
      </div>
    </div> 
  </div>
</template>

<style lang="scss">
@import '../assets/_colors.css';
.event-creation {
  padding-top: 10px;
  &__section {
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      gap: 20px;
  }
  &__preview {
    display: flex;
    gap: 20px;
    align-items: center;
    padding-bottom: 10px;
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
  &__content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-bottom: 1px solid var(--primary-gray);
    width: 80%;
  }
  &__date {
    color: var(--primary-gray);
    padding-bottom: 10px;
  }
  &__input-wrapper,
  &__datepicker-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
  }
  &__label {
      color: var(--primary-blue);
  }
  &__input-max-participants {
    width: 44px;
  }
  &__buttons-block {
    display: flex;
    gap: 20px;
    justify-content: flex-end;
  }
  &__button {
    padding: 8px 16px;
    font-size: 16px;
    font-weight: 600;
    background-color: var(--bg_color);
    border: none;
    cursor: pointer;
    color: var(--primary-gray);
    transition: background-color 0.3s ease;
    &:hover {
      color: var(--primary-blue);
    }
  }
  .dp__theme_light,
  .dp__theme_dark {
    --dp-background-color:  var(--bg_color);
    border: none;
  }  
  
  
}
</style>