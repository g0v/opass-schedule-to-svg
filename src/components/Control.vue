<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="mb-3 flex items-center justify-between gap-3">
    <span class="shrink-0 text-sm text-gray-600">{{ props.title }}</span>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>
