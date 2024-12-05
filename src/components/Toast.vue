<script setup>
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const positionClass = 'toast--bottom'

</script>

<template>
  <div v-if="props.visible" class="toast" :class="positionClass">
    <div class="toast__message">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 20px;
  background-color: var(--bg_color);
  color: var(--text-color);
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  opacity: 0;
  animation: fadeInOut 2s ease-out forwards;
}

.toast--bottom {
  bottom: 20px;
}

.toast__message {
  font-size: 14px;
  text-align: center;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    bottom: 0;
  }
  30% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    bottom: -50px;
  }
}
</style>
