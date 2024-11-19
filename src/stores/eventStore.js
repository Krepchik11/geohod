import { defineStore } from 'pinia'

export const useEventStore = defineStore( 'event', {
  state: () => ({
    events: JSON.parse( localStorage.getItem( 'events' ) ) || [], // Массив мероприятий
  }),
  actions: {
    addEvent( event ) {
      event.id = Date.now(); 
      this.events.push( event ) // Добавляем мероприятие в список
      localStorage.setItem( 'events', JSON.stringify( this.events ) ) // Сохраняем список в localStorage
    },
    getEventById(id) {
      return this.events.find(event => event.id === id) // Находим событие по ID
    },
  },
})
