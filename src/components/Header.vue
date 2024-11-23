<script setup>
import { BackButton } from "vue-tg"
import { useRoute } from "vue-router"

const route = useRoute();

function handleBackButton() {
  window.history.back(); 
}
</script>

<template>
  <div class="header">
    <BackButton v-if="route.path !== '/'" @click="handleBackButton" />
    <div class="header__title">
      <slot></slot>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  border-bottom: 4px solid var(--primary-gray);
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100%;
  font-size: 20px;
  font-weight: 500;
  &__link {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 30px;
  }
}
</style>