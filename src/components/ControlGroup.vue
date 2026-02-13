<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})
const emit = defineEmits(['reset'])
</script>

<template>
  <div class="rounded-xl border border-slate-300 bg-white p-4">
    <h3 class="mb-4 flex items-center justify-between border-b border-slate-300 pb-1 font-bold text-gray-900">
      {{ props.title }}
      <button class="reset-btn" @click="emit('reset')" title="重置此區塊">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </h3>

    <div>
      <slot />
    </div>
  </div>
</template>
