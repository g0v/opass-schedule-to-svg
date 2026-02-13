<script setup>
const model = defineModel()
</script>

<template>
  <input type="color" v-model="model" />
</template>

<style scoped>
input[type='color'] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  width: 32px;
  height: 32px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
  background: none;
  box-shadow: 0 0 0 1px var(--border-color);
}

input[type='color']::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type='color']::-webkit-color-swatch {
  border: none;
}
</style>
