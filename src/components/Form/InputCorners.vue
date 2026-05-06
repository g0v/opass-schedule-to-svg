<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => ['tl', 'tr', 'br', 'bl'],
  },
})

const emit = defineEmits(['update:modelValue'])

const corners = [
  { id: 'tl', icon: 'M12 6 A6 6 0 0 0 6 12', label: '左上' },
  { id: 'tr', icon: 'M12 6 A6 6 0 0 1 18 12', label: '右上' },
  { id: 'bl', icon: 'M12 18 A6 6 0 0 1 6 12', label: '左下' },
  { id: 'br', icon: 'M12 18 A6 6 0 0 0 18 12', label: '右下' },
]

const toggleCorner = (id) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(id)
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(id)
  }
  emit('update:modelValue', newValue)
}

const isActive = (id) => props.modelValue.includes(id)
</script>

<template>
  <div class="grid grid-cols-2 gap-1.5">
    <button
      v-for="corner in corners"
      :key="corner.id"
      type="button"
      @click="toggleCorner(corner.id)"
      class="flex h-8 w-8 items-center justify-center rounded border transition-all"
      :class="[
        isActive(corner.id) ? 'active-corner shadow-sm' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600',
      ]"
      :title="`${corner.label}圓角`"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" :d="corner.icon" />
        <path v-if="!isActive(corner.id)" stroke-linecap="round" stroke-width="1.5" d="M10 6h4 M10 18h4 M6 10v4 M18 10v4" opacity="0.3" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.active-corner {
  border-color: var(--primary-color);
  background-color: color-mix(in srgb, var(--primary-color), white 90%);
  color: var(--primary-color);
}
</style>
