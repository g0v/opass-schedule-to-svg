<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  show: {
    type: Boolean,
    default: null, // If null, hide the toggle
  },
})
const emit = defineEmits(['reset', 'update:show'])
</script>

<template>
  <div class="rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition-all">
    <h3 class="mb-2 flex items-center gap-3 border-b border-slate-100 pb-2 font-bold text-slate-800">
      <button
        v-if="props.show !== null"
        type="button"
        @click="emit('update:show', !props.show)"
        class="flex h-7 w-7 items-center justify-center rounded-md transition-all"
        :class="props.show ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'"
        :title="props.show ? '點擊隱藏此區塊' : '點擊顯示此區塊'"
      >
        <svg v-if="props.show" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        </svg>
      </button>
      <span class="grow text-sm">{{ props.title }}</span>
      <button
        class="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        @click="emit('reset')"
        title="重置此區塊"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </h3>

    <div class="mt-4 transition-all duration-300" :class="{ 'opacity-40 grayscale-[0.5] pointer-events-none select-none': props.show === false }">
      <slot />
    </div>
  </div>
</template>
