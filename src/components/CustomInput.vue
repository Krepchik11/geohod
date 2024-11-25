<script setup>
import { ref, defineProps, defineEmits, watch, defineExpose } from 'vue'

const props = defineProps({
  modelValue: {
    type: [ String, Number ],
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Введите текст...',
  },
  maxLength: {
    type: Number,
    default: 99,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  acceptNumbersOnly: {
    type: Boolean,
    default: false,
  }
});

const inputValue = ref( props.modelValue )
const inputElement = ref( null )

const emit = defineEmits( [ 'update:modelValue', 'blur' ] )

watch(inputValue, (newValue) => {
  let updatedValue = newValue;
  if ( props.acceptNumbersOnly ) {
    updatedValue = updatedValue.toString().replace(/[^0-9]/g, '')
    if ( updatedValue.startsWith('0') && updatedValue.length > 1 ) {
      updatedValue = updatedValue.replace(/^0+/, '');
    }
    if ( +updatedValue > props.maxLength ) {
      updatedValue = props.maxLength.toString()
    }
  }
  emit( 'update:modelValue', updatedValue )
  inputValue.value = updatedValue
})

function focusInput() {
  if (inputElement.value) {
    inputElement.value.focus()
  }
}

defineExpose({
  focusInput
})

</script>

<template>
  <div class="custom-input">
    <input
      ref="inputElement"
      v-model="inputValue"
      class="custom-input__element"
      :maxLength="maxLength"
      :placeholder="placeholder"
      @input="() => {}"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus')"
    />
    <div class="custom-input__border">
      <span v-if="showLabel" class="custom-input__label">{{ label }}</span>
      <span v-if="maxLength" class="custom-input__char-limit">{{ maxLength }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-input {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 400px;
  
  &__border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    border: 2px solid var(--primary-gray);
    border-radius: 8px;
    pointer-events: none;
    z-index: 1;
    transition: border-color 0.3s ease; 
  }

  &__label {
    position: absolute;
    top: -10px;
    left: 12px;
    background: var(--bg_color);
    padding: 0 4px;
    font-size: 12px;
    color: var(--primary-gray);
    transition: color 0.3s ease;
  }

  &__char-limit {
    position: absolute;
    bottom: -10px;
    right: 12px;
    background: var(--bg_color);
    padding: 0 4px;
    font-size: 12px;
    color: var(--primary-gray);
    transition: color 0.3s ease;
  }

  &__element {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 40px;
    border: none;
    padding: 0 12px;
    box-sizing: border-box;
    border-radius: 8px;
    font-size: 14px;
    color: var(--primary-gray);
    background: transparent;
    outline: none;
  }

  .custom-input__element:focus + .custom-input__border {
    border-color: var(--primary-blue);
  }

  .custom-input__element:focus + .custom-input__border .custom-input__label,
  .custom-input__element:focus + .custom-input__border .custom-input__char-limit {
    color: var(--primary-blue); 
  }
}
</style>
