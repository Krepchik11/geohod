<script setup>
import { defineProps, defineEmits } from 'vue'
import { useWebAppTheme } from 'vue-tg'
import { RouterLink } from 'vue-router'

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  isAuthor: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['showContextMenu', 'touchStart', 'touchEnd'])

const { colorScheme } = useWebAppTheme()

function formattedDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

function isEventFinished(eventDate) {
  if (!eventDate) return false
  return new Date(eventDate) < new Date()
}
</script>

<template>
  <div class="event-item">
    <div 
      class="event-content"
      @click.stop="(e) => emit('showContextMenu', e, event.id)"
      @touchstart="(e) => emit('touchStart', e, event.id)"
      @touchend="(e) => emit('touchEnd', e)"
    >
      <div class="event-avatar">
        <img 
          :src="event.author?.imageUrl || '/src/assets/geohod_640-360.jpg'"
          alt="Avatar" 
          class="avatar-image"
        >
      </div>
      <div class="event-details">
        <div class="event-name">{{ event.description }}</div>
        <div class="event-description">{{ formattedDate(event.date) }}</div>
      </div>
      <div class="event-right">
        <div 
          class="participant-badge" 
          :class="{ 'participant-badge--dark': colorScheme === 'dark' }"
        >
          {{ event.currentParticipants }}
        </div>
      </div>
    </div>
    <div 
      v-if="isEventFinished(event.date) && isAuthor" 
      class="event-actions"
    >
      <RouterLink 
        :to="{ name: 'finish', params: { id: event.id }}" 
        class="btn-complete"
      >
        Завершить
      </RouterLink>
    </div>
    <div class="divider"></div>
  </div>
</template>

<style lang="scss" scoped>
.event-item {
  margin-bottom: 16px;
}

.event-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.event-avatar {
  width: 50px;
  height: 50px;
  margin-right: 16px;
  border-radius: 50%;
  overflow: hidden;
  
  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.event-details {
  flex: 1;
}

.event-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.event-description {
  font-size: 14px;
  color: var(--primary-gray);
}

.event-right {
  margin-left: 16px;
}

.participant-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-color-num);
  color: var(--color-num);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  
  &--dark {
    background-color: var(--chatlist-pinned-color-darck);
    color: var(--badge-text-color);
  }
}

.event-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.btn-complete {
  color: var(--primary-blue);
  font-size: 18px;
  text-decoration: none;
  font-weight: 500;
}

.divider {
  height: 1px;
  background-color: var(--primary-gray);
  margin-top: 8px;
  opacity: 0.5;
}
</style> 