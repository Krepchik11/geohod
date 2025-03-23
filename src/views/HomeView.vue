<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEventStore } from '../stores/eventStore'
import { useContextMenu } from '../composables/useContextMenu'
import EventCard from '@/components/EventCard.vue'
import { usePermissions } from '../composables/usePermissions'
import { useEventManagement } from '../composables/useEventManagement'

import Header from '../components/Header.vue'
import ContextMenu from '../components/ContextMenu.vue'

const botName = import.meta.env.VITE_BOT_NAME

const eventStore = useEventStore()
const router = useRouter()
const {
  refreshing,
  error: eventsError,
  handleRefresh,
  copyEventLink,
  cancelEventRegistration,
  isLoading
} = useEventManagement()

const {
  contextMenuVisible,
  contextMenuPosition,
  showContextMenu: showBaseContextMenu,
  closeContextMenu,
  startTouch,
  cancelTouch
} = useContextMenu()

const {
  checkWriteAccess,
  isWriteAccessGranted,
  error: permissionError
} = usePermissions()

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

// Improve loading state management with a dedicated function
const fetchEvents = async () => {
  handleRefresh()
}

// Modify initializeApp to handle errors better
const initializeApp = async () => {
  try {
    await checkWriteAccess()
    await fetchEvents()
  } catch (err) {
    console.error('Error initializing app:', err)
    eventsError.value = err.message || 'Произошла ошибка при загрузке приложения'
  }
}

onMounted(() => {
  initializeApp()
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

async function handleMenuSelect(item) {
  const eventId = contextMenuPosition.value.eventId
  
  switch (item.action) {
    case 'copy-link':
      const success = await copyEventLink(eventId, botName)
      showNotification({
        title: success ? 'Успешно' : 'Ошибка',
        message: success ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку',
        type: success ? 'success' : 'error'
      })
      break
      
    case 'cancel':
      const cancelled = await cancelEventRegistration(eventId)
      showNotification({
        title: cancelled ? 'Успешно' : 'Ошибка',
        message: cancelled ? 'Участие отменено' : 'Не удалось отменить участие',
        type: cancelled ? 'success' : 'error'
      })
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
    case 'messages':
      sendMessageToAuthor()
      break       
    default:
      console.log( 'Неизвестное действие' )
  }
  closeContextMenu()
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
          :class="{ 'is-refreshing': refreshing || isLoading }"
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
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-indicator" role="status" aria-label="Загрузка мероприятий">
      <p>Загрузка мероприятий...</p>
    </div>

    <!-- Permission Error -->
    <div v-if="permissionError" class="error-container" role="alert">
      <svg class="error-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p class="error-text">{{ permissionError }}</p>
      <button class="retry-button" @click="checkWriteAccess">
        Запросить разрешения
      </button>
    </div>

    <!-- Main Content -->
    <div v-else-if="isWriteAccessGranted" class="home__section" role="main">
      <!-- Skeleton Loading State -->
      <div v-if="isLoading" class="home__section" role="status" aria-label="Загрузка мероприятий">
        <div 
          v-for="n in 3" 
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

      <!-- Event List -->
      <TransitionGroup 
        v-if="eventStore.events.length > 0"
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

.loading-indicator {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: var(--color-text-secondary);
}
</style>
