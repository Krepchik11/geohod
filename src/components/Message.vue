<script setup>

</script>

<template>

  <div class="message">
    <slot></slot>
  </div>

</template>

<style lang="scss" scoped>
.message {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  color: var(--primary-red);
}
</style>