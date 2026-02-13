<script setup>
const props = defineProps({
  max: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    required: true,
  },
  step: {
    type: Number,
    default: 1,
  },
})

const model = defineModel()
</script>

<template>
  <input type="range" :min="props.min" :max="props.max" :step="props.step" v-model.number="model" />
</template>

<style scoped>
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  background: #e5e7eb;
  height: 6px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
}

input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}
</style>
