<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore.js'

import Header from '../components/Header.vue'

import { MainButton } from 'vue-tg'

const route = useRoute()
const router = useRouter()
const eventStore = useEventStore()

const eventId = Number( route.params.id )

function deleteEvent() {
  if ( eventId ) {
    eventStore.deleteEvent( eventId )
    router.push( '/' )
  } else {
    alert( 'Ошибка: ID события не найден.' )
  }
}
</script>

<template>
  <div class="delete-event">
    <Header>Удаление мероприятия</Header>
    <MainButton text="Удалить" @click="deleteEvent" />
  </div>
</template>

<style lang="scss" scoped>

</style>
