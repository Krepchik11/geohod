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

        // Фильтрация только активных событий
        const activeEvents = Array.isArray( data.content )
          ? data.content.filter( event => event.status === 'ACTIVE' )
          : []

        this.events = activeEvents
        console.log( 'data:', data )
        
      } catch ( error ) {
        console.error( 'Failed to fetch events:', error )
        this.events = []
        throw error 
      }
    },
    
    setDisabledEventId(id) {
      this.disabledEventId = id;
    },

    incrementParticipants(id) {
      const event = this.events.find(event => event.id === id);
      if (event) event.currentParticipants += 1;
    },

  },
})
