import { defineStore } from 'pinia'
import { EventsService } from '../services/eventsService'

export const useEventStore = defineStore( 'eventStore', {
  state: () => ({
    events: [],
    registeredEventIds: [], // Список ID зарегистрированных мероприятий
    disabledEventId: null,
    isLoading: false,
    error: null,
    currentPage: 0, // Track the current page
    pageSize: 10, // Set the default page size
    totalPages: 0, // Track total pages
  }),
  getters: {
    registeredEvents( state ) {
      return state.events.filter( event => state.registeredEventIds.includes( event.id ) )
    },
    
    getEventById: (state) => (id) => {
      return state.events.find(event => event.id === id)
    },
    
    hasEvents: (state) => state.events.length > 0
  },
  actions: {
    async fetchEvents() {
      if (this.isLoading || (this.currentPage > 0 && this.currentPage >= this.totalPages)) return; // Prevent multiple fetches and check for total pages
      this.isLoading = true;
      this.error = null;

      try {
        const response = await EventsService.getEvents(this.currentPage, this.pageSize);
        this.events.push(...response.content); // Append new events
        this.currentPage++; // Increment the page for the next fetch
        this.totalPages = response.page.totalPages; // Update total pages
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    
    setDisabledEventId( id ) {
      this.disabledEventId = id
    },

    incrementParticipants( id ) {
      const event = this.events.find( event => event.id == id )
      if ( event ) event.currentParticipants += 1
    },

    async registerForEvent(eventId) {
      try {
        await EventsService.registerForEvent(eventId)
        this.registeredEventIds.push(eventId)
        const event = this.getEventById(eventId)
        if (event) {
          event.currentParticipants += 1
        }
      } catch (error) {
        throw error
      }
    },

    async unregisterFromEvent(eventId) {
      try {
        await EventsService.unregisterFromEvent(eventId)
        this.registeredEventIds = this.registeredEventIds.filter(id => id !== eventId)
        const event = this.getEventById(eventId)
        if (event) {
          event.currentParticipants -= 1
        }
      } catch (error) {
        throw error
      }
    },

    updateEventLocally(eventId, updates) {
      const eventIndex = this.events.findIndex(e => e.id === eventId)
      if (eventIndex !== -1) {
        this.events[eventIndex] = { ...this.events[eventIndex], ...updates }
      }
    },
  },
})
