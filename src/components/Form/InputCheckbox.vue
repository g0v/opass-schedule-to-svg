<script setup>
const model = defineModel()
</script>

<template>
  <label class="toggle-switch">
    <input type="checkbox" v-model="model" />
    <span class="slider"></span>
  </label>
</template>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin-left: auto;
  /* Align to right if needed */
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
