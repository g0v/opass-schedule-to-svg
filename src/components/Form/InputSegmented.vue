<script setup>
const props = defineProps({
  options: {
    type: Array,
    required: true,
    // Expected format: [{ label: 'Label', value: true }, { label: 'Label', value: false }]
  },
})

const model = defineModel()

function select(value) {
  model.value = value
}
</script>

<template>
  <div class="inline-flex rounded-lg bg-slate-100 p-1 shadow-inner">
    <button
      v-for="opt in props.options"
      :key="String(opt.value)"
      type="button"
      @click="select(opt.value)"
      class="rounded-md px-3 py-1 text-xs font-bold transition-all"
      :class="model === opt.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
/* No extra styles needed as we use Tailwind-like utility classes from the project or custom ones */
</style>
