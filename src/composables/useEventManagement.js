import { ref, computed } from 'vue'
import { useEventStore } from '../stores/eventStore'
import { NotificationService } from '../services/notificationService'

export function useEventManagement() {
  const eventStore = useEventStore()
  const refreshing = ref(false)
  const error = ref(null)
  const isLoading = ref(false)

  const handleRefresh = async () => {
    if (refreshing.value) return
    
    refreshing.value = true
    isLoading.value = true
    try {
      await eventStore.fetchEvents() // Fetch events from the store
    } catch (err) {
      error.value = 'Failed to refresh events'
      await NotificationService.showNotification({
        title: 'Ошибка',
        message: 'Не удалось обновить список мероприятий',
        type: 'error'
      })
    } finally {
      refreshing.value = false
      isLoading.value = false
    }
  }

  const copyEventLink = async (eventId, botName) => {
    try {
      const eventLink = `https://t.me/${botName}/app?startapp=registration_${eventId}`
      const success = await NotificationService.copyToClipboard(eventLink)
      
      if (success) {
        await NotificationService.showNotification({
          title: 'Успешно',
          message: 'Ссылка скопирована в буфер обмена',
          type: 'success'
        })
      } else {
        throw new Error('Failed to copy')
      }
      
      return true
    } catch (error) {
      console.error('Failed to copy link:', error)
      await NotificationService.showNotification({
        title: 'Ошибка',
        message: 'Не удалось скопировать ссылку',
        type: 'error'
      })
      return false
    }
  }

  const cancelEventRegistration = async (eventId) => {
    try {
      await EventsService.unregisterFromEvent(eventId)
      await eventStore.fetchEvents() // Refresh events after unregistering
      
      await NotificationService.showNotification({
        title: 'Успешно',
        message: 'Участие отменено',
        type: 'success'
      })
      return true
    } catch (error) {
      console.error('Failed to cancel registration:', error)
      await NotificationService.showNotification({
        title: 'Ошибка',
        message: 'Не удалось отменить участие. Пожалуйста, попробуйте еще раз.',
        type: 'error'
      })
      return false
    }
  }

  return {
    refreshing,
    error,
    isLoading,
    handleRefresh,
    copyEventLink,
    cancelEventRegistration,
    events: computed(() => eventStore.events),
    hasEvents: computed(() => eventStore.hasEvents)
  }
} 