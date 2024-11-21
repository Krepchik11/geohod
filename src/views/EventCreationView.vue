<script setup>
import { ref } from 'vue'

import { useRouter  } from "vue-router"
import { useEventStore } from '@/stores/eventStore'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import CustomInput  from '../components/CustomInput.vue'
import Header from '../components/Header.vue'

const eventStore = useEventStore()
const router = useRouter()

const date = ref( null )
const maxParticipants = ref( '' )
const description = ref( '' )

function createEvent() {
  if ( !description.value || !date.value || !maxParticipants.value ) return 

  const newEvent = {
    description: description.value,
    date: date.value,
    maxParticipants: maxParticipants.value,
  }

  eventStore.addEvent( newEvent ) 
  router.push( '/' )
}

function cansel() {
  router.push( '/' )
}

</script>

<template>
  <div class="event-creation">
    <Header>Создание мероприятия</Header>
    <div class="event-creation__section">
      <CustomInput 
        v-model="description" 
        :maxLength="99" 
        :showLabel="true"
        label="Название" 
        placeholder="Введите название" 
      />
      <div class="event-creation__label">Дата</div>
      <div class="event-creation__datepicker">
          <VueDatePicker v-model="date"></VueDatePicker>
      </div>
      <div class="event-creation__label">Максимум участников</div>
      <div class="event-creation__input-max-participants">
        <CustomInput
          v-model="maxParticipants"
          :maxLength="99"
          :acceptNumbersOnly="true"
          :showLabel="false"
          label="Максимум участников"
          placeholder="0"
        />
      </div>
      <div class="event-creation__buttons">
        <button 
          class="event-creation__button event-creation__button--cancel"
          @click="cansel"
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

<style lang="scss" scoped>
@import '../assets/_colors.css';
.event-creation {
  padding-top: 10px;
  &__section {
      padding: 0 12px;
  }
  &__label {
      color: var(--primary-blue);
  }
  &__input-max-participants {
    width: 50px;
  }
}
</style>
