<script setup>
import { ref, onMounted, onActivated, nextTick, computed } from 'vue'
import { useRouter, useRoute  } from "vue-router"
import { useWebAppTheme } from 'vue-tg'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ru } from 'date-fns/locale'

import { useEventStore } from '../stores/eventStore.js'
import CustomInput  from '../components/CustomInput.vue'
import Header from '../components/Header.vue'

const eventStore = useEventStore()
const router = useRouter()
const route = useRoute()

const theme = useWebAppTheme()

const dataPickerTheme = ref( theme.colorScheme.value === 'dark' ? true : false )

const date = ref( new Date() )
const maxParticipants = ref( 30 )
const currentParticipants = ref( 0 )
const description = ref( '' )
const childInput = ref( null )
const isInputBlurred = ref( false )
const isEditing = ref( false )

const isEditMode = computed( () => !!eventId.value )

// Получаем ID из маршрута
const eventId = computed(() => Number( route.params.id ))

// Ищем событие в хранилище
const eventData = computed(() => 
  eventStore.events.find( event => event.id === eventId.value )
)

function saveEvent() {
  if ( !description.value || !date.value || !maxParticipants.value ) return 

  const updatedEvent = {
    id: eventId.value || Date.now(), 
    description: description.value,
    date: date.value,
    maxParticipants: maxParticipants.value,
    currentParticipants: eventData.value ? eventData.value.currentParticipants : 0,
  }

  if ( isEditMode.value ) {
    eventStore.updateEvent( updatedEvent )
  } else {
    eventStore.addEvent( updatedEvent )
  }

  router.push( '/' )
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
    focusInput();
  });
}

function blurInput() {
  isInputBlurred.value = true
  isEditing.value = false
}

function focusInput() {
  isInputBlurred.value = false
  childInput.value.focusInput()
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
    childInput.value.focusInput() // Устанавливаем фокус на первый инпут при активации компонента
  })
  if ( isEditMode.value && eventData.value ) {
    description.value = eventData.value.description
    date.value = new Date( eventData.value.date )
    maxParticipants.value = eventData.value.maxParticipants
    currentParticipants.value = eventData.value.currentParticipants
  }
})

</script>

<template>
  <div class="event-creation">
    <!-- <Header>{{ isEditMode ? 'Редактирование мероприятия' : 'Создание мероприятия' }}</Header> -->
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
        
      />
      <div class="event-creation__datepicker-wrapper">
        <div class="event-creation__label">Дата</div>
        <div class="event-creation__datepicker">
          <!-- :enableTimePicker="false" Отключает функциональность выбора времени -->
          <!-- :hideInput="true" Скрываем отображение выбранной даты -->
            <VueDatePicker
              v-model="date" 
              :dark="dataPickerTheme" 
              inline
              auto-apply
              :locale="ru"
              :enableTimePicker="false" 
            ></VueDatePicker>
        </div>
      </div>
      <div class="event-creation__input-wrapper">
        <div class="event-creation__label">Максимум участников</div>
        <div class="event-creation__input-max-participants">
          <CustomInput
            v-model="maxParticipants"
            :maxLength="99"
            :acceptNumbersOnly="true"
            :showLabel="false"
            label="Максимум участников"
            placeholder="30"
          />
        </div>
      </div>
      <div class="event-creation__buttons-block">
        <button 
          class="event-creation__button event-creation__button--cancel"
          @click="cancel"
        >
          Отмена
        </button>
        <button 
          class="event-creation__button event-creation__button--confirm"
          @click="saveEvent" 
        >
          Ок
          <!-- {{ isEditMode ? 'Сохранить' : 'Создать' }} -->
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
    width: 50px;
    height: 50px;
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
    position: fixed;
    bottom: 50px;
    right: 30px;
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
