import { get, post, put, del } from '../utils/api'
import { mockEvents } from './mockData'

const isDevEnvironment = process.env.NODE_ENV === 'development'
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export class EventsService {
  static async getEvents() {
    try {
      // Return mock data in development mode if enabled
      if (isDevEnvironment && useMockData) {
        console.debug('Using mock events data')
        return mockEvents
      }

      const response = await get('/events')
      return response.content;
    } catch (error) {
      console.error('Failed to fetch events:', error)
      throw new Error('Failed to fetch events')
    }
  }

  static async registerForEvent(eventId) {
    try {
      if (isDevEnvironment && useMockData) {
        const event = mockEvents.find(e => e.id === eventId)
        if (event) {
          event.currentParticipants += 1
          return event
        }
        throw new Error('Event not found')
      }

      return await post(`/events/${eventId}/register`)
    } catch (error) {
      console.error('Failed to register for event:', error)
      throw new Error('Failed to register for event')
    }
  }

  static async unregisterFromEvent(eventId) {
    try {
      if (isDevEnvironment && useMockData) {
        const event = mockEvents.find(e => e.id === eventId)
        if (event && event.currentParticipants > 0) {
          event.currentParticipants -= 1
          return event
        }
        throw new Error('Event not found or no participants')
      }

      return await del(`/events/${eventId}/unregister`)
    } catch (error) {
      console.error('Failed to unregister from event:', error)
      throw new Error('Failed to unregister from event')
    }
  }

  static async updateEvent(eventId, eventData) {
    try {
      if (isDevEnvironment && useMockData) {
        const eventIndex = mockEvents.findIndex(e => e.id === eventId)
        if (eventIndex !== -1) {
          mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...eventData }
          return mockEvents[eventIndex]
        }
        throw new Error('Event not found')
      }

      return await put(`/events/${eventId}`, eventData)
    } catch (error) {
      console.error('Failed to update event:', error)
      throw new Error('Failed to update event')
    }
  }

  static async createEvent(eventData) {
    try {
      if (isDevEnvironment && useMockData) {
        const newEvent = {
          ...eventData,
          id: String(mockEvents.length + 1),
          currentParticipants: 0,
          status: 'ACTIVE'
        }
        mockEvents.push(newEvent)
        return newEvent
      }

      return await post('/events', eventData)
    } catch (error) {
      console.error('Failed to create event:', error)
      throw new Error('Failed to create event')
    }
  }
} 