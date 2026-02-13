<script setup>
import { computed } from 'vue'

const props = defineProps(['obj', 'prop', 'unit', 'type', 'label', 'min', 'max', 'step', 'options'])

const value = computed({
  get: () => {
    if (!props.obj) return ''
    if (props.obj.style === undefined) return ''
    const regex = new RegExp(`${props.prop}\\s*:\\s*([^;"]+)`)
    const match = (props.obj.style || '').match(regex)
    if (!match) return ''
    let val = match[1].trim()
    if (props.unit && val.endsWith(props.unit)) return val.slice(0, -props.unit.length)
    if (props.prop === 'font-family') return val.replace(/&#x27;/g, "'")
    return val
  },
  set: val => {
    if (!props.obj) return
    if (props.obj.style === undefined) props.obj.style = ''

    let currentStyle = props.obj.style || ''
    let newVal = val + (props.unit || '')

    const regex = new RegExp(`${props.prop}\\s*:\\s*([^;"]+)`)
    if (currentStyle.match(regex)) {
      props.obj.style = currentStyle.replace(regex, `${props.prop}:${newVal}`)
    } else {
      currentStyle = currentStyle.trim()
      if (currentStyle && !currentStyle.endsWith(';') && currentStyle !== '') currentStyle += ';'
      props.obj.style = currentStyle + `${props.prop}:${newVal}`
    }
  },
})
</script>

<template>
  <div class="items-between mb-3 flex justify-between gap-3">
    <span class="shrink-0 text-sm text-gray-600">{{ label }}</span>
    <div class="flex items-center justify-end gap-2" :style="type === 'select' ? 'flex: 1' : ''">
      <input v-if="type === 'range'" type="range" :min="min" :max="max" :step="step" v-model="value" />
      <select v-if="type === 'select'" v-model="value" style="width: 100%; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.875rem">
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input v-if="type !== 'select'" :type="type === 'color' ? 'color' : type === 'range' ? 'number' : 'text'" :step="step" v-model="value" :style="type === 'color' ? '' : ''" />
      <input v-if="type === 'color'" type="text" v-model="value" style="width: 70px" />
    </div>
  </div>
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

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

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
