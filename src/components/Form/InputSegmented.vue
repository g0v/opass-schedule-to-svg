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
  <div class="flex w-full rounded-xl bg-slate-100 p-1 shadow-inner">
    <button
      v-for="opt in props.options"
      :key="String(opt.value)"
      type="button"
      @click="select(opt.value)"
      class="grow rounded-md px-2 py-1.5 text-xs font-bold tracking-tight transition-all duration-200 flex items-center justify-center gap-2"
      :class="model === opt.value ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'"
    >
      <span>{{ opt.label }}</span>
      <!-- Integrated Eye Toggle -->
      <div 
        v-if="opt.show !== undefined"
        @click.stop="opt.onToggle()"
        class="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-slate-200"
        :class="opt.show ? 'text-blue-500' : 'text-slate-300'"
      >
        <svg v-if="opt.show" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      </div>
    </button>
  </div>
</template>

<style scoped>
/* No extra styles needed as we use Tailwind-like utility classes from the project or custom ones */
</style>
