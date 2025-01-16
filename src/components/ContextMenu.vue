<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { defineProps, defineEmits } from 'vue'

import IconCopyLink from './icons/IconCopyLink.vue'
import IconCopy from './icons/IconCopy.vue'
import IconEdit from './icons/IconEdit.vue'
import IconPeople from './icons/IconPeople.vue'
import IconDelete from './icons/IconDelete.vue'
import IconMessages from './icons/IconMessages.vue'

defineProps({
  visible: Boolean,
  position: {
    type: Object,
    required: true,
    default: () => ({ x: 0, y: 0 })
  },
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits( [ 'close', 'select' ] )

function handleClickOutside( event ) {
  const contextMenu = document.querySelector( '.context-menu' )
  if ( contextMenu && !contextMenu.contains( event.target ) ) {
    emit( 'close' )
  }
}

function handleAction( action ) {
  emit( 'select', action )
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
    :style="{ top: `${ position.y }px`, left: `${ position.x }px` }"
  >
    <ul class="context-menu__list">
      <li
        class="context-menu__item"
        v-for="item in items"
        :key="item.action"
        @click.stop="handleAction( item )"
      >
        <IconCopyLink v-if="item.icon === 'copy-link'" />
        <IconCopy v-if="item.icon === 'copy'" />
        <IconEdit v-if="item.icon === 'edit'" />
        <IconPeople v-if="item.icon === 'people'" />
        <IconMessages v-if="itom.icon === 'messages'"
        <IconDelete v-if="item.icon === 'delete'" />

        <span class="context-menu__label">{{ item.label }}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  background-color: var(--bg_color);
  border: 1px solid var(--secondary_bg_color);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 1000;

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    gap: 10px;
    cursor: pointer;

    &:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    &:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }

    &:hover {
      background-color: var(--primary-gray);
    }
  }

  &__icon {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }

  &__label {
    font-size: 14px;
    color: var(--text_color);
  }
}
</style>
