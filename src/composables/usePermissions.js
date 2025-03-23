import { ref } from 'vue'

export function usePermissions() {
  const isWriteAccessGranted = ref(false)
  const error = ref(null)
  const isChecking = ref(false)

  const checkWriteAccess = async () => {
    const botId = import.meta.env.VITE_BOT_ID
    const isDevEnvironment = process.env.NODE_ENV === 'development'

    // Skip permission check in development
    if (isDevEnvironment) {
      isWriteAccessGranted.value = true
      return true
    }

    try {
      isChecking.value = true

      // Check if we already have write access
      if (window.Telegram.WebApp.initDataUnsafe.user?.allows_write_to_pm) {
        isWriteAccessGranted.value = true
        return true
      }

      // Request write access if we don't have it
      const granted = await window.Telegram.WebApp.requestWriteAccess({
        write_access_purpose: 'Для создания и управления мероприятиями',
        bot_id: botId,
      })

      isWriteAccessGranted.value = granted
      return granted
    } catch (err) {
      error.value = 'Не удалось получить необходимые разрешения'
      console.error('Permission error:', err)
      throw new Error('Permission check failed')
    } finally {
      isChecking.value = false
    }
  }

  const resetPermissions = () => {
    isWriteAccessGranted.value = false
    error.value = null
    isChecking.value = false
  }

  return {
    isWriteAccessGranted,
    isChecking,
    error,
    checkWriteAccess,
    resetPermissions
  }
} 