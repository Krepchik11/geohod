import { get, post, put } from '../utils/api';
import { mockEvents, mockUsers } from './mockData';

const isDevEnvironment = process.env.NODE_ENV === 'development';
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const dataService = {
  async getEvents() {
    if (isDevEnvironment && useMockData) {
      return Promise.resolve(mockEvents);
    }
    return get('/api/events');
  },

  async getUsers() {
    if (isDevEnvironment && useMockData) {
      return Promise.resolve(mockUsers);
    }
    return get('/api/users');
  },

  async createEvent(eventData) {
    if (isDevEnvironment && useMockData) {
      const newEvent = {
        ...eventData,
        id: String(mockEvents.length + 1),
        status: 'active'
      };
      mockEvents.push(newEvent);
      return Promise.resolve(newEvent);
    }
    return post('/api/events', eventData);
  },

  async updateEvent(eventId, eventData) {
    if (isDevEnvironment && useMockData) {
      const eventIndex = mockEvents.findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        mockEvents[eventIndex] = { ...mockEvents[eventIndex], ...eventData };
        return Promise.resolve(mockEvents[eventIndex]);
      }
      return Promise.reject(new Error('Event not found'));
    }
    return put(`/api/events/${eventId}`, eventData);
  }
}; 