<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ['top', 'bottom', 'left', 'right'],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const sides = [
  { id: 'top', icon: 'M4 6h16', label: '上' },
  { id: 'bottom', icon: 'M4 18h16', label: '下' },
  { id: 'left', icon: 'M6 4v16', label: '左' },
  { id: 'right', icon: 'M18 4v16', label: '右' },
]

const toggleSide = id => {
  if (props.disabled) return
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(id)
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(id)
  }
  emit('update:modelValue', newValue)
}

const isActive = id => props.modelValue.includes(id)
</script>

<template>
  <div class="flex gap-1.5">
    <button
      v-for="side in sides"
      :key="side.id"
      type="button"
      @click="toggleSide(side.id)"
      :disabled="props.disabled"
      class="flex h-8 w-8 items-center justify-center rounded border transition-all disabled:pointer-events-none disabled:opacity-40"
      :class="[isActive(side.id) ? 'active-side shadow-sm' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600']"
      :title="`顯示${side.label}邊框`"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" :d="side.icon" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.active-side {
  border-color: var(--primary-color);
  background-color: color-mix(in srgb, var(--primary-color), white 90%);
  color: var(--primary-color);
}
</style>
