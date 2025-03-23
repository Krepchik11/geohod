<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore'
import { del } from '../utils/api'
import { useContextMenu } from '../composables/useContextMenu'
import EventCard from '@/components/EventCard.vue'
import { dataService } from '@/services/dataService'

import Header from '../components/Header.vue'
import ContextMenu from '../components/ContextMenu.vue'

const botId = import.meta.env.VITE_BOT_ID
const botName = import.meta.env.VITE_BOT_NAME

const eventStore = useEventStore()
const router = useRouter()
const isLoading = ref(true)
const isWriteAccessRequested = ref(false)
const error = ref(null)

const {
  contextMenuVisible,
  contextMenuPosition,
  showContextMenu: showBaseContextMenu,
  closeContextMenu,
  startTouch,
  cancelTouch
} = useContextMenu()

const isLowPerformance = computed(() => {
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.includes('android') && window.Telegram.WebApp.platform.toLowerCase() === 'android'
    && window.Telegram.WebApp.initDataUnsafe.platform_performance_class < 2
})

// Extract user ID from Telegram init data
const extractedId = (() => {
  const initData = window.Telegram.WebApp.initData
  const params = new URLSearchParams(decodeURIComponent(initData))
  const userParam = params.get('user')
  return userParam ? JSON.parse(userParam).id : null
})()

// Move menuItems initialization to be more declarative
const menuItems = ref([
  { 
    label: 'Копировать ссылку',
    action: 'copy-link',
    icon: 'copy-link',
    description: 'Поделиться мероприятием' 
  }
]) // Initialize with common actions by default

const isDevEnvironment = process.env.NODE_ENV === 'development';

// Add skeleton loading for better UX
const showSkeleton = ref(true)
const skeletonCount = 3

// Improve loading state management
const fetchEvents = async () => {
  try {
    if (!isLoading.value) {
      isLoading.value = true
      showSkeleton.value = true
    }
    
    // Check for write access only in production environment
    if (!isDevEnvironment && !window.Telegram.WebApp.initDataUnsafe.write_access && !isWriteAccessRequested.value) {
      isWriteAccessRequested.value = true
      await Telegram.WebApp.requestWriteAccess({
        write_access_purpose: 'access_purpose',
        bot_id: botId,
      })
    }

    // Fetch events with minimum loading time to prevent flashing
    const [events] = await Promise.all([
      dataService.getEvents(),
      new Promise(resolve => setTimeout(resolve, 300))
    ])
    
    eventStore.events = events
  } catch (err) {
    error.value = 'Не удалось загрузить мероприятия. Попробуйте обновить страницу.'
    console.error(err)
  } finally {
    setTimeout(() => {
      isLoading.value = false
      showSkeleton.value = false
    }, 300)
  }
}

// Add pull-to-refresh functionality

const refreshing = ref(false)
const handleRefresh = async () => {
  refreshing.value = true
  await fetchEvents()
  refreshing.value = false
}

onMounted(() => {
  fetchEvents()
})

function updateMenuItems(eventId) {
  if (!eventId) {
    console.warn('No eventId provided to updateMenuItems')
    return
  }

  const selectedEvent = eventStore.events.find(e => e.id === eventId)
  if (!selectedEvent) {
    console.warn('No event found with ID:', eventId)
    return
  }

  const isAuthor = selectedEvent.author?.id === extractedId

  // Create menu items immediately without unnecessary console.logs
  menuItems.value = [
    { 
      label: 'Копировать ссылку',
      action: 'copy-link',
      icon: 'copy-link',
      description: 'Поделиться мероприятием' 
    },
    ...(isAuthor ? [
      { 
        label: 'Редактировать',
        action: 'edit',
        icon: 'edit',
        description: 'Изменить детали мероприятия',
        shortcut: '⌘E' 
      },
      { 
        label: 'Участники',
        action: 'participants',
        icon: 'people',
        description: 'Управление списком участников',
        badge: selectedEvent.participants?.length || 0
      },
      {
        label: 'Копировать',
        action: 'copy',
        icon: 'copy',
        description: 'Создать копию мероприятия'
      },
      { type: 'separator' },
      { 
        label: 'Отменить',
        action: 'delete',
        icon: 'delete',
        description: 'Отменить мероприятие',
        variant: 'danger'
      }
    ] : [
      { 
        label: 'Сообщение автору',
        action: 'messages',
        icon: 'messages',
        description: `Написать ${selectedEvent.author?.name || 'автору'}`
      },
      { type: 'separator' },
      { 
        label: 'Отменить участие',
        action: 'cancel',
        icon: 'delete',
        description: 'Отказаться от участия',
        variant: 'danger'
      }
    ])
  ]
}

function handleMenuSelect( item ) {
  switch ( item.action ) {
    case 'copy-link':
      copyLink()
      break
    case 'copy':
      const eventToCopy = eventStore.events.find( event => event.id == contextMenuPosition.value.eventId )
      if ( eventToCopy ) {
        router.push({
            name: 'createEvent',
            query: {
                description: eventToCopy.description,
                date: eventToCopy.date,
                maxParticipants: eventToCopy.maxParticipants,
            }
        })
      }
      break
    case 'edit':
      router.push({ name: 'edit', params: { id: contextMenuPosition.value.eventId } })
      break
    case 'participants':
      router.push({ name: 'participants', params: { id: contextMenuPosition.value.eventId } })
      break
    case 'delete':
      router.push( { name: 'delete', params: { id: contextMenuPosition.value.eventId } } )
      break
    case 'cancel':
      cancelRegistration()
      break 
    case 'messages':
      sendMessageToAuthor()
      break       
    default:
      console.log( 'Неизвестное действие' )
  }
  closeContextMenu()
}

async function copyLink() {
  const eventId = contextMenuPosition.value.eventId

  if (!eventId) {
    console.error('Event ID отсутствует')
    return
  }

  try {
    const eventLink = `https://t.me/${botName}/app?startapp=registration_${eventId}`
    
    // Copy the link
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(eventLink)
    } else {
      copyTextToClipboard(eventLink)
    }

    // Try to provide feedback if available
    if (window.Telegram?.WebApp?.hapticFeedback) {
      try {
        window.Telegram.WebApp.hapticFeedback.notificationOccurred('success')
      } catch (e) {
        console.debug('Haptic feedback not available:', e)
      }
    }

    // Show success message
    showNotification({
      title: 'Успешно',
      message: 'Ссылка скопирована в буфер обмена',
      type: 'success'
    })
  } catch (error) {
    console.error('Ошибка копирования ссылки:', error)
    showNotification({
      title: 'Ошибка',
      message: 'Не удалось скопировать ссылку',
      type: 'error'
    })
  }
}

function copyTextToClipboard( text ) {
  const textArea = document.createElement( 'textarea' )
  textArea.value = text
  textArea.style.position = 'fixed'
  document.body.appendChild( textArea )
  textArea.focus()
  textArea.select()
  try {
    document.execCommand( 'copy' )
  } catch ( error ) {
    console.error( 'Ошибка при использовании execCommand:', error )
  }
  document.body.removeChild( textArea )
}

// Replace showSuccessToast and showErrorToast with a single notification function
function showNotification(options) {
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

async function cancelRegistration() {
  const eventId = contextMenuPosition.value.eventId

  if (!eventId) {
    console.error('Event ID отсутствует')
    return
  }

  try {
    await del(`/api/v1/events/${eventId}/unregister`)
    eventStore.events = eventStore.events.filter((event) => event.id !== eventId)
    await eventStore.fetchEvents()
    
    showNotification({
      title: 'Успешно',
      message: 'Участие отменено',
      type: 'success'
    })
  } catch (error) {
    console.error('Ошибка при отмене регистрации:', error)
    showNotification({
      title: 'Ошибка',
      message: 'Не удалось отменить участие. Пожалуйста, попробуйте еще раз.',
      type: 'error'
    })
  }
}

function sendMessageToAuthor( ) {
    const eventId = contextMenuPosition.value.eventId

    if ( !eventId ) {
      console.error( 'Event ID отсутствует' )
      return
    }
    
    const event = eventStore.events.find( e => e.id == eventId )
    
    if ( !event ) {
      console.error( 'Мероприятие не найдено' )
      return
    }
    
    const authorUsername = event.author?.username
    
    if ( !authorUsername ) {
      console.error( 'Автор мероприятия отсутствует или у него нет username' )
      return
    }
    
    const telegramUrl = `https://t.me/${ authorUsername }`
    window.open( telegramUrl, '_blank' )
}

function handleContextMenu(event, eventId) {
  event.preventDefault()
  
  // Update menu items synchronously before showing the menu
  updateMenuItems(eventId)
  
  // Show menu immediately if we have items
  if (menuItems.value.length > 0) {
    showBaseContextMenu(event, eventId)
  }
}

</script>

<template>
  <div 
    class="home"
    :class="{
      'low-performance': isLowPerformance,
      'safe-area': true
    }"
  >
    <Header>
      <div class="header-content">
        <h1 class="header-title">Мои мероприятия</h1>
        <button 
          class="refresh-button"
          :class="{ 'is-refreshing': refreshing }"
          @click="handleRefresh"
          :disabled="refreshing || isLoading"
          aria-label="Обновить список"
        >
          <svg class="refresh-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>
      </div>
    </Header>
    
    <!-- Loading State with Skeletons -->
    <div 
      v-if="showSkeleton"
      class="home__section"
      role="status"
      aria-label="Загрузка мероприятий"
    >
      <div 
        v-for="n in skeletonCount" 
        :key="n"
        class="skeleton-card"
        aria-hidden="true"
      >
        <div class="skeleton-header"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div 
      v-else-if="error" 
      class="error-container"
      role="alert"
    >
      <svg class="error-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p class="error-text">{{ error }}</p>
      <button 
        class="retry-button"
        @click="fetchEvents"
      >
        Повторить
      </button>
    </div>
    
    <!-- Content -->
    <div 
      v-else 
      class="home__section"
      role="main"
    >
      <!-- Empty State -->
      <div 
        v-if="!eventStore.events.length"
        class="empty-state"
      >
        <svg class="empty-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>
        </svg>
        <p class="empty-text">У вас пока нет мероприятий</p>
        <RouterLink 
          to="/create"
          class="empty-action"
        >
          Создать мероприятие
        </RouterLink>
      </div>

      <!-- Event List -->
      <TransitionGroup 
        v-else
        name="event-list"
        tag="div"
        class="event-list"
        :class="{ 'no-animation': isLowPerformance }"
      >
        <EventCard
          v-for="event in eventStore.events"
          :key="event.id"
          :event="event"
          :is-author="event.author?.id == extractedId"
          @show-context-menu="handleContextMenu"
          @touch-start="startTouch"
          @touch-end="cancelTouch"
        />
      </TransitionGroup>
      
      <ContextMenu 
        :visible="contextMenuVisible"
        :position="contextMenuPosition"
        :items="menuItems"
        @select="handleMenuSelect"
        @close="closeContextMenu"
      />
    </div>

    <!-- FAB -->
    <RouterLink 
      to="/create" 
      class="fab"
      aria-label="Создать новое мероприятие"
    >
      <svg 
        class="icon-plus" 
        viewBox="0 0 24 24" 
        aria-hidden="true"
      >
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
      <span class="fab-tooltip">Создать мероприятие</span>
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.home {
  position: relative;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  padding-top: 44px;
  
  &.safe-area {
    padding: calc(44px + env(safe-area-inset-top, 0px)) 
             env(safe-area-inset-right, 0px)
             env(safe-area-inset-bottom, 0px)
             env(safe-area-inset-left, 0px);
  }
  
  &__section {
    max-width: 768px;
    margin: 0 auto;
    padding: 16px 16px calc(80px + env(safe-area-inset-bottom, 0px));
  }
}

// Header styles
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.refresh-button {
  background: none;
  border: none;
  padding: 8px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.refresh-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

// Skeleton loading
.skeleton-card {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  animation: pulse 1.5s ease-in-out infinite;

  .skeleton-header {
    height: 24px;
    background: var(--color-text-secondary);
    opacity: 0.1;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .skeleton-line {
    height: 16px;
    background: var(--color-text-secondary);
    opacity: 0.1;
    border-radius: 4px;
    margin-bottom: 8px;
    width: 80%;

    &:last-child {
      width: 60%;
    }
  }
}

// Error state
.error-container {
  text-align: center;
  padding: 32px 16px;
  
  .error-icon {
    width: 48px;
    height: 48px;
    fill: var(--color-error);
    margin-bottom: 16px;
  }

  .error-text {
    color: var(--color-text-secondary);
    margin-bottom: 24px;
  }

  .retry-button {
    background: var(--color-button-background);
    color: var(--color-button-text);
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }
  }
}

// Empty state
.empty-state {
  text-align: center;
  padding: 48px 16px;

  .empty-icon {
    width: 64px;
    height: 64px;
    fill: var(--color-text-secondary);
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    color: var(--color-text-secondary);
    margin-bottom: 24px;
  }

  .empty-action {
    background: var(--color-button-background);
    color: var(--color-button-text);
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 500;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }
  }
}

// Event list
.event-list {
  display: grid;
  gap: 16px;
}

// FAB
.fab {
  position: fixed;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  right: max(16px, env(safe-area-inset-right, 16px));
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-fab-background);
  color: var(--color-fab-text);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover .fab-tooltip {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:active {
    transform: scale(0.95);
  }

  .icon-plus {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  .fab-tooltip {
    position: absolute;
    bottom: 100%;
    right: 0;
    background: var(--color-surface);
    color: var(--color-text-primary);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 8px;
    white-space: nowrap;
    opacity: 0;
    transform: translateY(4px);
    transition: all 0.2s ease;
    pointer-events: none;
  }
}

// Animations
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.event-list {
  &-move,
  &-enter-active,
  &-leave-active {
    transition: all 0.3s ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
}

// Performance optimizations
.no-animation {
  * {
    animation: none !important;
    transition: none !important;
  }
}

.low-performance {
  .fab,
  .refresh-button {
    transition: none;
  }
}

// Responsive adjustments
@media (min-width: 768px) {
  .home__section {
    padding-left: max(16px, calc((100% - 768px) / 2));
    padding-right: max(16px, calc((100% - 768px) / 2));
  }

  .event-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
