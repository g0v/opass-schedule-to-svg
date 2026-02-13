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
  <div class="mx-auto px-2 py-4" style="max-width: 1080px">
    <h1 class="mb-2 text-3xl">Opass Schedule to SVG</h1>

    <header class="mb-2 flex">
      <div class="mr-auto">
        <div class="mb-2 flex gap-2">
          <button v-for="date in dates" @click="setDate(date)" class="btn" :class="{ active: selectedDate === date }">{{ date }}</button>
        </div>

        <div v-if="selectedDate" class="flex gap-2">
          <button v-for="room in rooms" @click="setRoom(room)" class="btn" :class="{ active: selectedRoom === room }">{{ room }}</button>
        </div>
      </div>

      <div class="flex items-end gap-2 self-end">
        <template v-if="hasDateAndRoom">
          <RouterLink to="/playground">
            <button class="btn" type="button">Playground</button>
          </RouterLink>
          <button @click="download" class="btn">Download</button>
        </template>
      </div>
    </header>

    <div v-if="hasDateAndRoom">
      <img :src="`./data/${selectedDate}-${selectedRoom}.svg`" />
    </div>
  </div>
</template>
