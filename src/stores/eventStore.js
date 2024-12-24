import { defineStore } from 'pinia'
import { get, post } from '../utils/api'

export const useEventStore = defineStore( 'eventStore', {
  state: () => ({
    events: [],
    disabledEventId: null,
  }),
  actions: {
    async fetchEvents() {
      try {
        const data = await get( '/api/v1/events' )
        this.events = Array.isArray( data.content ) ? data.content : [];
        console.log( 'data:', data )
        
      } catch ( error ) {
        console.error( 'Failed to fetch events:', error );
        this.events = [];
        throw error; 
      }
    },    
  },
})

// export const useEventStore = defineStore( 'event', {
//   state: () => ({
//     events: [
//       {
//         id: 1,
//         name: 'Мероприятие 1',
//         description: 'Описание мероприятия 1',
//         currentParticipants: 0,
//         maxParticipants: 20,
//         date: new Date('2024-12-01T10:00:00'), 
//       },
//       {
//         id: 2,
//         name: 'Мероприятие 2',
//         description: 'Описание мероприятия 2',
//         currentParticipants: 2,
//         maxParticipants: 15,
//         date: new Date('2024-12-05T14:00:00'), 
//       },
//       {
//         id: 3,
//         name: 'Мероприятие 3',
//         description: 'Описание мероприятия 3',
//         currentParticipants: 3,
//         maxParticipants: 10,
//         date: new Date('2024-12-10T09:00:00'), 
//       },
//       {
//         id: 4,
//         name: 'Мероприятие 4',
//         description: 'Описание мероприятия 4',
//         currentParticipants: 4,
//         maxParticipants: 20,
//         date: new Date('2024-12-15T18:00:00'), 
//       },
//       {
//         id: 5,
//         name: 'Мероприятие 5',
//         description: 'Описание мероприятия 5',
//         currentParticipants: 5,
//         maxParticipants: 25,
//         date: new Date('2024-12-20T11:00:00'),
//       },
//       {
//         id: 6,
//         name: 'Мероприятие 6',
//         description: 'Описание мероприятия 6',
//         currentParticipants: 0,
//         maxParticipants: 20,
//         date: new Date('2024-12-01T10:00:00'), 
//       },
//       {
//         id: 7,
//         name: 'Мероприятие 7',
//         description: 'Описание мероприятия 7',
//         currentParticipants: 2,
//         maxParticipants: 15,
//         date: new Date('2024-12-05T14:00:00'), 
//       },
//       {
//         id: 8,
//         name: 'Мероприятие 8',
//         description: 'Описание мероприятия 8',
//         currentParticipants: 3,
//         maxParticipants: 10,
//         date: new Date('2024-12-10T09:00:00'), 
//       },
//       {
//         id: 9,
//         name: 'Мероприятие 9',
//         description: 'Описание мероприятия 9',
//         currentParticipants: 4,
//         maxParticipants: 20,
//         date: new Date('2024-12-15T18:00:00'), 
//       },
//       {
//         id: 10,
//         name: 'Мероприятие 10',
//         description: 'Описание мероприятия 10',
//         currentParticipants: 5,
//         maxParticipants: 25,
//         date: new Date('2024-12-20T11:00:00'),
//       },
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
