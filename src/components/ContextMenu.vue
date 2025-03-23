<script setup>
import { onMounted, onBeforeUnmount, computed } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({
      x: 0,
      y: 0,
      eventId: null
    })
  },
  items: {
    type: Array,
    default: () => []
  }
})

// Add console log to debug props
console.log('ContextMenu props:', {
  visible: props.visible,
  position: props.position,
  items: props.items
})

const positionStyle = computed(() => {
  if (!props.position) return {}
  
  return {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`
  }
})

const emit = defineEmits( [ 'close', 'select' ] )

function handleClickOutside( event ) {
  const contextMenu = document.querySelector( '.context-menu' )
  if ( contextMenu && !contextMenu.contains( event.target ) ) {
    emit( 'close' )
  }
}

onMounted(() => {
  document.addEventListener( 'click', handleClickOutside )
})

onBeforeUnmount(() => {
  document.removeEventListener( 'click', handleClickOutside )
})

</script>

<template>
  <div 
    v-if="visible" 
    class="context-menu"
    :style="positionStyle"
    role="menu"
    @keydown.esc="$emit('close')"
  >
    <!-- Debug info -->
    <div v-if="!items?.length" class="debug-info">
      No menu items available
    </div>
    
    <div 
      v-for="(item, index) in items" 
      :key="index"
      :class="[
        'context-menu-item',
        item.type === 'separator' && 'context-menu-separator',
        item.variant && `context-menu-item--${item.variant}`
      ]"
      role="menuitem"
      :tabindex="item.type === 'separator' ? -1 : 0"
      @click="$emit('select', item)"
    >
      <template v-if="item.type !== 'separator'">
        <div class="context-menu-item__content">
          <div class="context-menu-item__icon" v-if="item.icon">
            <i :class="['icon', `icon-${item.icon}`]" aria-hidden="true" />
          </div>
          
          <div class="context-menu-item__text">
            <div class="context-menu-item__label">{{ item.label }}</div>
            <div 
              v-if="item.description" 
              class="context-menu-item__description"
            >
              {{ item.description }}
            </div>
          </div>

          <div class="context-menu-item__meta">
            <kbd 
              v-if="item.shortcut" 
              class="context-menu-item__shortcut"
            >
              {{ item.shortcut }}
            </kbd>
            <span 
              v-if="typeof item.badge !== 'undefined'" 
              class="context-menu-item__badge"
              :class="{ 'context-menu-item__badge--highlight': item.badge > 0 }"
            >
              {{ item.badge }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  background: var(--color-surface);
  border-radius: 8px;
  padding: 4px;
  min-width: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  // Add debug styling
  .debug-info {
    padding: 8px 12px;
    color: var(--color-text-secondary);
    font-style: italic;
    font-size: 14px;
  }

  &-item {
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-surface-hover);
    }

    &__content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .icon {
        width: 100%;
        height: 100%;
      }
    }

    &__text {
      flex: 1;
    }

    &__label {
      font-size: 14px;
      color: var(--color-text-primary);
    }

    &__description {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &__shortcut {
      font-size: 12px;
      color: var(--color-text-secondary);
      background: var(--color-surface-variant);
      padding: 2px 4px;
      border-radius: 4px;
    }

    &__badge {
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 12px;
      background: var(--color-surface-variant);
      color: var(--color-text-secondary);

      &--highlight {
        background: var(--color-primary);
        color: var(--color-on-primary);
      }
    }

    &--danger {
      color: var(--color-error);
      
      &:hover {
        background-color: var(--color-error-container);
      }
    }
  }

  &-separator {
    height: 1px;
    background-color: var(--color-border);
    margin: 4px 0;
  }
}
</style>

