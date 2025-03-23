import { ref } from 'vue'

export function useContextMenu() {
  const contextMenuVisible = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })
  let touchTimer = null
  let isLongPress = false

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

  function startTouch(event, eventId) {
    isLongPress = false
    touchTimer = setTimeout(() => {
      isLongPress = true
      showContextMenu(event, eventId)
    }, 600)
    event.target.addEventListener('touchmove', cancelTouch, { passive: false })
    event.target.addEventListener('touchcancel', cancelTouch, { passive: false })
  }

  function cancelTouch(event) {
    clearTimeout(touchTimer)
    if (isLongPress) {
      event.preventDefault()
      event.stopPropagation()
    }
    event.target.removeEventListener('touchmove', cancelTouch)
  }

  return {
    contextMenuVisible,
    contextMenuPosition,
    showContextMenu,
    closeContextMenu,
    startTouch,
    cancelTouch
  }
} 