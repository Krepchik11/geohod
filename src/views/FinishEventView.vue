<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MainButton } from 'vue-tg'

import { useEventStore } from '../stores/eventStore'
import { get, patch } from '../utils/api'

import CustomInput  from '../components/CustomInput.vue'
import Header from '../components/Header.vue'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

const notificationsEnabled = ref( false )
const votingLinkEnabled = ref( false )
const donationRequestEnabled = ref( false )
const participants = ref( [] )

const eventId = computed( () =>  route.params.id )

const selectedEvent = computed(() => {
  const event = eventStore.events.find(event => event.id === eventId.value)
  if (event) {
    return {
      ...event,
      participants: event.participants
    }
  }
})

async function loadParticipants() {
  try {
    const data = await get( `/api/v1/events/${ eventId.value }/participants` )
    if ( !data || !data.participants ) throw new Error( 'Участники не найдены.' )
    participants.value = data.participants
  } catch ( error ) {
    console.error( 'Ошибка загрузки участников:', error )
    participants.value = [];
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

async function finishEvent() {
  try {
    const payload = {
      notifyParticipants: notificationsEnabled.value,
      sendPollLink: votingLinkEnabled.value,
      sendDonationRequest: donationRequestEnabled.value,
    };

    const response = await patch( `/api/v1/events/${ eventId.value }/finish`, payload )

    if ( response.message === 'success' ) {
      console.log( 'Мероприятие успешно завершено.' )
      router.push( '/' )
    } else {
      console.error( 'Ошибка при завершении мероприятия:', response )
    }
  } catch (error) {
    console.error( 'Ошибка завершения мероприятия:', error )
  }
}

function handleKeyDown( event ) {
  if ( event.key === 'Enter' || event.code === 'Enter') {
    event.target.blur()
    event.preventDefault()
  }
}


onMounted(() => {
  loadParticipants()
})


</script>

<template>
  <div class="finish-section">
    <Header>Завершение мероприятия</Header>
    <div class="finish-section__content" v-if="selectedEvent">
      <h3 class="finish-section__title">{{ selectedEvent.description }}</h3>
      <div class="finish-section__details">
        <p class="finish-section__date">{{ formattedDate( selectedEvent.date ) }}</p>
      </div>
      <div class="finish-section__members-title">Участники</div>
      <div class="finish-section__members-list">
        <div class="finish-section__members-avatars">
          <div
          v-for="( participant, index ) in participants.slice( 0, 3 )"
          :key="index"
          class="finish-section__avatar"
          :style="{ backgroundImage: `url(${ participant.imageUrl || '/src/assets/geohod_640-360.jpg' })` }"
          ></div>
        </div>
        <div class="finish-section__members-all">{{ participants.length }} человек</div>
      </div>
      <div class="finish-section__members-send">
        <div class="finish-section__members-send-title">Направить участникам</div>
        <div class="finish-section__members-send-options">
          <!-- <div class="finish-section__checkbox">
            <label>
              <input
                type="checkbox"
                v-model="notificationsEnabled"
              />
              Уведомление об окончании
            </label>
            <span class="finish-section__checkbox-status">
              {{ notificationsEnabled ? 'Вкл.' : 'Выкл.' }}
            </span>
          </div> -->
          <div class="finish-section__checkbox">
            <label>
              <input
                type="checkbox"
                v-model="votingLinkEnabled"
              />
              Ссылку для голосования
            </label>
            <!-- <span class="finish-section__checkbox-status">
              {{ votingLinkEnabled ? 'Вкл.' : 'Выкл.' }}
            </span> -->
          </div>
          <div class="finish-section__checkbox">
            <label>
              <input
                type="checkbox"
                v-model="donationRequestEnabled"
              />
              Инф. о размере доната
              
            </label>
            <!-- <span class="finish-section__checkbox-status">
              {{ donationRequestEnabled ? 'Вкл.' : 'Выкл.' }}
            </span> -->
            <div class="finish-section__input">
              <CustomInput
                ref="childInput"
                v-model="description" 
                :showLabel="true"
                label="число и валюта" 
                placeholder="500 динар"   
                @keydown="handleKeyDown"
               />
            </div>
          </div>
        </div>
      </div>
      <MainButton text="Завершить" @click="finishEvent" />
    </div>

    <div v-else>
      <p>Мероприятие не найдено</p>
      <MainButton text="Назад" @click="router.push( '/' )" />
    </div>
  </div>
  
</template>

<style lang="scss" scoped>
.finish-section {
  padding: 0 12px;

  &__content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }

  &__title {
    font-size: 1em;
    line-height: 1.375rem;
    font-weight: 500;
  }

  &__date {
    font-size: 1em;
    line-height: 1.375rem;
    color: var(--primary-blue);
  }

  &__members-title {
    color: var(--primary-blue);
  }

  &__members-list {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__members-avatars {
    display: flex;
    position: relative;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-size: cover;
    background-position: center;
    border: 4px solid white;
    position: relative;
    z-index: 1;

    &:nth-child(1) {
      z-index: 3;
    }

    &:nth-child(2) {
      z-index: 2;
      margin-left: -23px; 
    }

    &:nth-child(3) {
      z-index: 1;
      margin-left: -23px; 
    }
  }

  &__members-send-title {
    color: var(--primary-blue);
  }

  &__members-send {
    margin-top: 20px;

    &-title {
      color: var(--primary-blue);
      margin-bottom: 20px;
    }

    &-options {
      display: flex;
      flex-direction: column;
      padding: 0 12px;
      gap: 30px;
    }
  }

  &__checkbox {
    display: flex;
    flex-direction: column;

    label {
      display: flex;
      width: 100%;
      gap: 30px;
    }

    &-status {
      margin-left: 43px;
      color: var(--primary-gray);
    }
  }

  &__input {
    padding-top: 20px;
  }
}


</style>