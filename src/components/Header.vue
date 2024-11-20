<script setup>
import { useRoute, RouterLink } from "vue-router"

const route = useRoute()

function linkTo() {
  return "/"
}

function isHomeRoute() {
  return route.path === "/"
}

</script>

<template>
  <div class="header">
    <template v-if="isHomeRoute()">
      <div class="header__link"></div>
      <!-- <svg class="header__link" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 18L20 18" stroke="#a0a0a0" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 12L20 12" stroke="#a0a0a0" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 6L20 6" stroke="#a0a0a0" stroke-width="2" stroke-linecap="round"/>
      </svg> -->
    </template>
    <template v-else>
      <RouterLink :to="linkTo()" class="header__link">
        <svg width="24" height="24"  fill="#a0a0a0" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path d="M222.927 580.115l301.354 328.512c24.354 28.708 20.825 71.724-7.883 96.078s-71.724 20.825-96.078-7.883L19.576 559.963a67.846 67.846 0 01-13.784-20.022 68.03 68.03 0 01-5.977-29.488l.001-.063a68.343 68.343 0 017.265-29.134 68.28 68.28 0 011.384-2.6 67.59 67.59 0 0110.102-13.687L429.966 21.113c25.592-27.611 68.721-29.247 96.331-3.656s29.247 68.721 3.656 96.331L224.088 443.784h730.46c37.647 0 68.166 30.519 68.166 68.166s-30.519 68.166-68.166 68.166H222.927z"/>
        </svg>
      </RouterLink>
    </template>
    <slot class="header__title"></slot>
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
  background-color: var(--bg_color);
  &__link {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 30px;
  }
  &__title {
    color: var(--primary-gray);
  }
}
</style>