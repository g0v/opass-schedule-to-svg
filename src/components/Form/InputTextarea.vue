<script setup>
const model = defineModel()
</script>

<template>
  <textarea v-model="model"></textarea>
</template>

<style scoped>
textarea {
  width: 100%;
  height: 120px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  resize: vertical;
  background-color: #f9fafb;
  color: #374151;
  line-height: 1.4;
}
</style>
