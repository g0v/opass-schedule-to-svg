<script setup>
import { ref, computed, onMounted } from 'vue'

const dates = ref([])
const rooms = ref([])
const selectedDate = ref('')
const selectedRoom = ref('')
const hasDateAndRoom = computed(() => selectedDate.value && selectedRoom.value)

onMounted(async () => {
  ;[dates.value, rooms.value] = await Promise.all([fetch('./data/dates.json').then(res => res.json()), fetch('./data/rooms.json').then(res => res.json())])
})

function setDate(date) {
  selectedDate.value = date
}

function setRoom(room) {
  selectedRoom.value = room
}

function download() {
  if (!selectedDate.value || !selectedRoom.value) return
  const url = `./data/${selectedDate.value}-${selectedRoom.value}.svg`
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedDate.value}-${selectedRoom.value}.svg`
  a.click()
}
</script>

<template>
  <div>
    <h1>Opass Schedule to SVG</h1>

    <header class="header">
      <div class="header-left">
        <div class="btns">
          <button v-for="date in dates" @click="setDate(date)" :class="{ active: selectedDate === date }">{{ date }}</button>
        </div>

        <div v-if="selectedDate" class="btns">
          <button v-for="room in rooms" @click="setRoom(room)" :class="{ active: selectedRoom === room }">{{ room }}</button>
        </div>
      </div>

      <div class="header-right" style="display: flex; gap: 0.5rem; align-items: flex-end">
        <template v-if="hasDateAndRoom">
          <RouterLink to="/playground" style="text-decoration: none">
            <button type="button">Playground</button>
          </RouterLink>
          <button @click="download">Download</button>
        </template>
      </div>
    </header>

    <div v-if="hasDateAndRoom">
      <img :src="`./data/${selectedDate}-${selectedRoom}.svg`" />
    </div>
  </div>
</template>

<style scoped>
:root {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    Segoe UI Symbol;
  --background: #111111;
  --primary: #c42026;
}

* {
  margin: 0;
  padding: 0;
  color: white;
}

body {
  background: var(--background);
  padding: 1rem 0.5rem;
  max-width: 1080px;
  margin: 0 auto;
}

img {
  max-width: 100%;
}

h1 {
  margin-bottom: 1rem;
  font-weight: 500;
}

button {
  all: unset;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border: 2px solid var(--primary);
  border-radius: 0.25rem;
  background-color: transparent;
  color: white;
  transition: all 0.2s ease;
}

button:hover,
button.active {
  background-color: var(--primary);
}

.btns {
  display: flex;
  gap: 0.5rem;
}

.btns:not(:last-child) {
  margin-bottom: 0.5rem;
}

.header {
  display: flex;
  margin-bottom: 0.5rem;
}

.header-left {
  margin-right: auto;
}

.header-right {
  align-self: flex-end;
}
</style>
