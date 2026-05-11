<script setup>
const model = defineModel()

function toggle() {
  model.value = !model.value
}
</script>

<template>
  <button
    type="button"
    @click="toggle"
    class="flex h-8 w-8 items-center justify-center rounded-md transition-all hover:bg-slate-100 active:scale-95"
    :class="model ? 'text-blue-600' : 'text-slate-400'"
    :title="model ? '目前為填色狀態' : '目前為透明狀態'"
  >
    <svg v-if="model" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M19.228 18.732l1.767-1.768 1.768 1.768a2.5 2.5 0 1 1-3.535 0zM8.878 1.08l11.35 11.35a1 1 0 0 1 0 1.414l-4.242 4.243a1 1 0 0 1-1.415 0L3.221 6.738a1 1 0 0 1 0-1.415l4.243-4.243a1 1 0 0 1 1.414 0zm.708 2.121L5.343 7.444l7.779 7.778 4.242-4.243-7.778-7.778z"
      />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.228 18.732l1.767-1.768 1.768 1.768a2.5 2.5 0 1 1-3.535 0z" />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M8.878 1.08l11.35 11.35a1 1 0 0 1 0 1.414l-4.242 4.243a1 1 0 0 1-1.415 0L3.221 6.738a1 1 0 0 1 0-1.415l4.243-4.243a1 1 0 0 1 1.414 0z"
      />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  </button>
</template>

<style scoped></style>
