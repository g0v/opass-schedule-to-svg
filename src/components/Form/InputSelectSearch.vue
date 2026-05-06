<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  searchable: {
    type: Boolean,
    default: true,
  },
})

const model = defineModel()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref(null)
const inputRef = ref(null)

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === model.value) || { label: '請選擇...' }
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(opt => {
    if (opt.disabled) return false // 搜尋時隱藏分隔線
    return opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
  })
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    setTimeout(() => {
      inputRef.value?.focus()
    }, 50)
  }
}

const selectOption = opt => {
  if (opt.disabled) return
  model.value = opt.value
  isOpen.value = false
}

const handleClickOutside = e => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full text-[0.875rem]" ref="containerRef">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      class="flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-2 py-1.5 text-left text-gray-700 shadow-none transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <span class="block truncate" :title="selectedOption.label">{{ selectedOption.label }}</span>
      <svg class="ml-2 h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 z-50 mt-1 max-h-[300px] w-[260px] overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-xl outline-none"
    >
      <div v-if="searchable" class="sticky top-0 z-10 bg-white px-2 pb-1.5 pt-1">
        <input
          ref="inputRef"
          type="text"
          v-model="searchQuery"
          class="w-full rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          placeholder="搜尋..."
          @click.stop
        />
      </div>
      <ul class="mt-1">
        <li
          v-for="opt in filteredOptions"
          :key="opt.value + opt.label"
          @click="selectOption(opt)"
          :class="[
            opt.disabled
              ? 'cursor-default bg-slate-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500'
              : 'cursor-pointer select-none px-3 py-2 text-sm transition-colors hover:bg-blue-50 hover:text-blue-900',
            model === opt.value && !opt.disabled ? 'bg-blue-100 font-semibold text-blue-900' : 'text-slate-700',
          ]"
        >
          <span class="block truncate" :style="opt.disabled ? '' : `font-family: ${opt.value}`">
            {{ opt.label }}
          </span>
        </li>
        <li v-if="filteredOptions.length === 0" class=" cursor-default select-none px-3 py-3 text-center text-sm text-gray-500">找不到相符的字型</li>
      </ul>
    </div>
  </div>
</template>
