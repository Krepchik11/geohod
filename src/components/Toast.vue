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
  background-color: var(--bg_color);
  color: var(--text-color);
  padding: 10px;
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  opacity: 0;
  animation: fadeInOut 2s ease-out forwards;
}

.toast--bottom {
  bottom: 20px;
}

.toast__message {
  font-size: 0.7rem;
  text-align: center;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  30% {
    opacity: 1;
    transform: translateY(0);
  }
  70% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
}

</style>
