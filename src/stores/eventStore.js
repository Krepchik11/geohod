import { defineStore } from 'pinia'

export const useEventStore = defineStore( 'event', {
  state: () => ({
    events: JSON.parse( localStorage.getItem( 'events' ) ) || [], // Массив мероприятий
    disabledEventId: null, // ID события, для которого кнопка заблокирована
  }),
  actions: {
    addEvent( event ) {
      event.id = Date.now(); 
      event.currentParticipants = event.currentParticipants ?? 0
      event.maxParticipants = event.maxParticipants ?? 0
      this.events.push( event ) // Добавляем мероприятие в список
      localStorage.setItem( 'events', JSON.stringify( this.events ) ) // Сохраняем список в localStorage
    },
    getEventById(id) {
      return this.events.find(event => event.id === id) // Находим событие по ID
    },
    setDisabledEventId(id) {
      this.disabledEventId = id; // Устанавливаем ID заблокированного события
      localStorage.setItem('disabledEventId', id); // Сохраняем в localStorage
    },
    incrementParticipants( id ) {
      this.$patch((state) => {
        const event = state.events.find( ( event ) => event.id === id )
        if ( event && event.currentParticipants < event.maxParticipants ) {
          event.currentParticipants++
        }
      })
      localStorage.setItem('events', JSON.stringify(this.events));
    },
    decrementParticipants(id) {
      const event = this.getEventById(id);
      if (event && event.currentParticipants > 0) {
        event.currentParticipants--;
        localStorage.setItem('events', JSON.stringify(this.events));
      }
    },
    deleteEvent(id) {
      this.events = this.events.filter(event => event.id !== id);
      localStorage.setItem('events', JSON.stringify(this.events));     
    },
  },
})
