export class NotificationService {
  static async showNotification(options) {
    const { title, message, type = 'default' } = options
    
    try {
      // Provide haptic feedback if available
      if (window.Telegram?.WebApp?.hapticFeedback) {
        try {
          window.Telegram.WebApp.hapticFeedback.notificationOccurred(type)
        } catch (e) {
          console.debug('Haptic feedback failed:', e)
        }
      }

      // Show notification with proper fallback
      if (window.Telegram?.WebApp) {
        try {
          // For newer versions that support showPopup
          window.Telegram.WebApp.showPopup({
            title,
            message,
            buttons: [{type: 'ok'}]
          })
        } catch (e) {
          // Fallback to showAlert for older versions
          window.Telegram.WebApp.showAlert(`${title}\n${message}`)
        }
      } else {
        // Fallback for web/non-Telegram environment
        alert(`${title}: ${message}`)
      }
    } catch (error) {
      console.debug('Notification system not available:', error)
      // Final fallback
      alert(`${title}: ${message}`)
    }
  }

  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
        } catch (error) {
          console.error('Error using execCommand:', error)
          throw error
        }
        document.body.removeChild(textArea)
      }
      return true
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return false
    }
  }
} 