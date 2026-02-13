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
  <div class="input-row">
    <label>{{ label }}</label>
    <div class="input-controls" :style="type === 'select' ? 'flex: 1' : ''">
      <input v-if="type === 'range'" type="range" :min="min" :max="max" :step="step" v-model="value" />
      <select v-if="type === 'select'" v-model="value" style="width: 100%; padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.875rem">
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input v-if="type !== 'select'" :type="type === 'color' ? 'color' : type === 'range' ? 'number' : 'text'" :step="step" v-model="value" :style="type === 'color' ? '' : ''" />
      <input v-if="type === 'color'" type="text" v-model="value" style="width: 70px" />
    </div>
  </div>
</template>

<style>
:root {
  --primary-color: #8da4be;
  --border-color: #e5e7eb;
  --bg-sidebar: #ffffff;
  --bg-main: #f3f4f6;
  --text-color: #374151;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  display: flex;
  height: 100vh;
  overflow: hidden;
  color: var(--text-color);
}

svg {
  max-width: 100%;
  height: auto;
}
</style>

<style scoped>
.sidebar {
  width: 400px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.header h2 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: var(--bg-main);
  overflow: auto;
  padding: 24px;
  position: relative;
}

.preview-container {
  background: white;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  padding: 1px;
  /* Preventing margin collapse */
}

.control-group {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: box-shadow 0.2s;
}

.control-group h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reset-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.reset-btn:hover {
  color: #ef4444;
  background: #fef2f2;
}

.reset-btn svg {
  width: 16px;
  height: 16px;
}

.control-group h4 {
  margin: 20px 0 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.input-row label:not(.toggle-switch) {
  font-size: 0.875rem;
  color: #4b5563;
  flex-shrink: 0;
  width: 70px;
}

.input-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0;
  justify-content: flex-end;
}

/* Toggle Switch */
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

/* Chrome/Safari 拉桿圓頭 */
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

/* Firefox 拉桿圓頭 */
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

textarea.css-editor {
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

.actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 4px 0;
  margin-top: 10px;
}

.btn {
  aspect-ratio: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #6b7280;
}

.btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.btn:active {
  transform: scale(0.9);
}

/* Hover 時強化顏色並填滿底色 */
.btn-primary:hover {
  background: #8da4be;
  color: white;
  border-color: #8da4be;
}

.btn-success:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-warning:hover {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-danger:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>
