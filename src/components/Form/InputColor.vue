<script setup>
const props = defineProps({
  hasValue: {
    type: Boolean,
    default: true,
  },
  disableNone: {
    type: Boolean,
    default: false,
  }
})

const emit = defineEmits(['update:hasValue'])
const model = defineModel()

function setNone() {
  if (props.disableNone) return
  emit('update:hasValue', false)
}

function setFill() {
  emit('update:hasValue', true)
}
</script>

<template>
  <div class="relative flex h-8 w-8 shrink-0 items-center justify-center">
    <!-- Main Color Picker -->
    <div class="relative h-8 w-8 overflow-visible">
      <input type="color" v-model="model" class="color-input" :class="{ 'is-none': !props.hasValue }" v-bind="$attrs" />

      <!-- Small "None" trigger at bottom-right/left -->
      <button
        v-if="props.hasValue && !props.disableNone"
        type="button"
        @click.stop.prevent="setNone"
        class="absolute -bottom-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-white shadow-sm transition-transform hover:scale-110"
        title="設為透明"
      >
        <div class="relative h-3 w-3 overflow-hidden rounded-full border border-slate-300">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="h-px w-[140%] rotate-[135deg] bg-red-500"></div>
          </div>
        </div>
      </button>

      <!-- Overlay when it IS none, click to restore -->
      <div
        v-if="!props.hasValue"
        @click="setFill"
        class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white shadow-inner"
        title="點擊恢復填色"
      >
        <div class="h-px w-[80%] rotate-[135deg] bg-red-500"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-input {
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
  transition: all 0.2s;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
}

.color-input.is-none {
  opacity: 0;
  pointer-events: none;
}

/* Make sure the container doesn't clip the small button */
.relative {
  overflow: visible;
}
</style>
