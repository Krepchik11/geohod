<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { Alert } from 'vue-tg'

const showAlert = ref(false)

function handleAlertClose() {
  showAlert.value = false // Скрыть алерт при закрытии
}

function handleButtonClick() {
  showAlert.value = true // Показать алерт при нажатии на кнопку
}
</script>

<template>
  <div>
    <div>Регистрация</div>
    <div>Фрушка гора: Каменоломня и скит</div>
    <button class="btn-check-in" @click="handleButtonClick">Зарегистрироваться</button>
    <Alert v-if="showAlert" message="Вы зарегистрированы! 
    С вашего баланса списано 5,000 руб" @close="handleAlertClose" />
  </div>
</template>

<style scoped>

.btn-check-in {
  margin-top: 50px;
  padding: 10px;
  color: #fff;
  background-color: #2696F1;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

</style>
