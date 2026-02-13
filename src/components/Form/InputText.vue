<script setup>
const props = defineProps({
  isNumber: {
    type: Boolean,
    default: false,
  },
  step: {
    type: Number,
    default: 1,
  },
})

const model = defineModel()
</script>

<template>
  <input v-if="props.isNumber" type="number" :step="props.step" v-model.number="model" />
  <input v-else type="text" v-model="model" />
</template>

<style scoped>
input[type='number'],
input[type='text'] {
  width: 70px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  text-align: right;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

input[type='number']:focus,
input[type='text']:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
