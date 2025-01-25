import { defineStore } from 'pinia'
import { get } from '../utils/api'

export const useEventStore = defineStore( 'eventStore', {
  state: () => ({
    events: [],
    registeredEventIds: [], // Список ID зарегистрированных мероприятий
    disabledEventId: null,
  }),
  getters: {
    registeredEvents( state ) {
      return state.events.filter( event => state.registeredEventIds.includes( event.id ) )
    },
  },
  actions: {
    async fetchEvents() {
      try {
        const data = await get( '/api/v1/events' )
        // Фильтрация только активных событий
        const activeEvents = Array.isArray( data.content )
          ? data.content.filter( event => event.status === 'ACTIVE' )
          : []
        this.events = activeEvents
        
      } catch ( error ) {
        console.error( 'Failed to fetch events:', error )
        this.events = []
        throw error 
      }
    },
    
    setDisabledEventId( id ) {
      this.disabledEventId = id
    },

    incrementParticipants( id ) {
      const event = this.events.find( event => event.id === id )
      if ( event ) event.currentParticipants += 1
    },

    registerForEvent( id ) {
      if ( !this.registeredEventIds.includes( id ) ) {
        this.registeredEventIds.push( id )
      }     
    },
  },
})
