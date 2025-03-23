import { mockEvents, mockUsers } from './mockData';

const isDevEnvironment = process.env.NODE_ENV === 'development';
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' 

export const dataService = {
  async getEvents() {
    if (isDevEnvironment && useMockData) {
      return Promise.resolve(mockEvents);
    }
    // Your actual API call here
    return fetch('/api/events').then(res => res.json());
  },

  async getUsers() {
    if (isDevEnvironment && useMockData) {
      return Promise.resolve(mockUsers);
    }
    // Your actual API call here
    return fetch('/api/users').then(res => res.json());
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
    // Your actual API call here
    return fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).then(res => res.json());
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
    // Your actual API call here
    return fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    }).then(res => res.json());
  }
}; 