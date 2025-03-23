import { ref } from 'vue'

export function useContextMenu() {
  const contextMenuVisible = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })

  function showContextMenu(event, eventId) {
    event.preventDefault()
    const menuWidth = 200
    const menuHeight = 150
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let x = event.clientX || event.touches?.[0]?.clientX
    let y = event.clientY || event.touches?.[0]?.clientY

    if (x + menuWidth > windowWidth) {
      x = windowWidth - menuWidth - 10
    }
    if (y + menuHeight > windowHeight) {
      y = y - menuHeight > 0 ? y - menuHeight - 10 : windowHeight - menuHeight - 10
    }

    contextMenuPosition.value = { x, y, eventId }
    contextMenuVisible.value = true
    document.addEventListener('click', closeContextMenu)
  }

  function closeContextMenu() {
    contextMenuVisible.value = false
    document.removeEventListener('click', closeContextMenu)
  }

  return {
    contextMenuVisible,
    contextMenuPosition,
    showContextMenu,
    closeContextMenu
  }
} 