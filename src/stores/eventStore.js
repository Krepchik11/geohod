import { defineStore } from 'pinia'
import { get } from '../utils/api'

export const useEventStore = defineStore( 'eventStore', {
  state: () => ({
    events: [],
    disabledEventId: null,
  }),
  actions: {
    async fetchEvents() {
      try {
        const data = await get( '/api/v1/events' )
        this.events = Array.isArray( data.content ) ? data.content : []
        console.log( 'data:', data )
        
      } catch ( error ) {
        console.error( 'Failed to fetch events:', error )
        this.events = []
        throw error 
      }
    },    
  },
})

// export const useEventStore = defineStore( 'event', {
//   state: () => ({
//     events: [
//     ],  // Массив мероприятий, который будет храниться в памяти
//     disabledEventId: null, // ID события, для которого кнопка заблокирована
//   }),
//   actions: {
//     addEvent( event ) {
//       event.id = Date.now() // Генерация ID для события
//       event.currentParticipants = event.currentParticipants ?? 0
//       event.maxParticipants = event.maxParticipants ?? 0
//       this.events.push( event ) // Добавляем мероприятие в список     
//     },
//     updateEvent( updatedEvent ) {
//       const index = this.events.findIndex( event => event.id === updatedEvent.id )
//       if ( index !== -1 ) {
//         this.events[ index ] = updatedEvent
//       }
//     },
//     getEventById( id ) {
//       return this.events.find( event => event.id === id ) // Находим событие по ID
//     },
//     setDisabledEventId( id ) {
//       this.disabledEventId = id // Устанавливаем ID заблокированного события
//     },
//     incrementParticipants( id ) {
//       const event = this.getEventById( id )
//       if ( event && event.currentParticipants < event.maxParticipants ) {
//         event.currentParticipants++
//       }
//     },
//     decrementParticipants( id ) {
//       const event = this.getEventById( id )
//       if ( event && event.currentParticipants > 0 ) {
//         event.currentParticipants--
//       }
//     },
//     deleteEvent( id ) {
//       this.events = this.events.filter( event => event.id !== id ) // Удаление события
//     },
//   },
// })
