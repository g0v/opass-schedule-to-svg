<script setup>
import { ref, computed, onMounted, watch, toRefs } from 'vue'
import { stringify } from 'svgson'
import { scheduleTemplate } from '~/template/scheduleTemplate.js'
import { formatDate } from '../../utils/formatDate.js'
import fallbackConfig from '../../style.config.json'
import { globalStore } from '../store.js'

const {
  dates, rooms, selectedDate, selectedRoom,
  showUploadUI, inputJsonUrl, inputStyleUrl,
  dynamicSchedule, dynamicStyleConfig,
  loadedScheduleName, loadedStyleName
} = toRefs(globalStore)

const hasDateAndRoom = computed(() => selectedDate.value && selectedRoom.value)

const dynamicSvgHtml = ref('')

onMounted(async () => {
  if (globalStore.playgroundDraftStyle) {
    if (confirm('偵測到您在 Playground 修改了樣式，是否要套用至首頁？')) {
      dynamicStyleConfig.value = JSON.parse(JSON.stringify(globalStore.playgroundDraftStyle))
      loadedStyleName.value = '來自 Playground 修改'
    }
    // 清除草稿避免重複詢問
    globalStore.playgroundDraftStyle = null
  }

  if (dates.value.length > 0 || dynamicSchedule.value) {
    return // Already loaded from store
  }
  try {
    const [datesRes, roomsRes, configRes] = await Promise.allSettled([
      fetch('./data/dates.json').then(res => { if (!res.ok) throw new Error(); return res.json() }),
      fetch('./data/rooms.json').then(res => { if (!res.ok) throw new Error(); return res.json() }),
      fetch('./data/style.config.json').then(res => { if (!res.ok) throw new Error(); return res.json() })
    ])
    
    if (datesRes.status === 'fulfilled') {
      dates.value = datesRes.value
      dates.value.sort()
    }
    if (roomsRes.status === 'fulfilled') {
      rooms.value = roomsRes.value
      rooms.value.sort()
    }
    if (configRes.status === 'fulfilled') {
      dynamicStyleConfig.value = configRes.value
    } else {
      dynamicStyleConfig.value = fallbackConfig
    }

    if (dates.value.length === 0) {
      showUploadUI.value = true
      loadedScheduleName.value = '無'
    }
  } catch (e) {
    console.error('Failed to load initial data:', e)
    showUploadUI.value = true
    dynamicStyleConfig.value = fallbackConfig
    loadedScheduleName.value = '無'
  }
})

watch([selectedDate, selectedRoom, dynamicSchedule, dynamicStyleConfig], () => {
  if (!dynamicSchedule.value || !hasDateAndRoom.value || !dynamicStyleConfig.value) return
  try {
    const sessions = dynamicSchedule.value.sessions.filter(s => formatDate(s.start) === selectedDate.value && s.room === selectedRoom.value)
    sessions.sort((a, b) => new Date(a.start) - new Date(b.start))
    const svgObj = scheduleTemplate(dynamicSchedule.value, sessions, dynamicStyleConfig.value)
    dynamicSvgHtml.value = stringify(svgObj)
  } catch (e) {
    console.error('Render error:', e)
  }
}, { deep: true, immediate: true }) // Added immediate true to render on mount

function setDate(date) {
  selectedDate.value = date
}

function setRoom(room) {
  selectedRoom.value = room
}

function processSchedule(schedule, name) {
  dynamicSchedule.value = schedule
  loadedScheduleName.value = name
  const d = new Set()
  const r = new Set()
  schedule.sessions.forEach(session => {
    d.add(formatDate(session.start))
    r.add(session.room)
  })
  dates.value = Array.from(d).sort()
  rooms.value = Array.from(r).sort()
  // Try to preserve selection if possible, else select first
  if (!dates.value.includes(selectedDate.value)) selectedDate.value = dates.value[0] || ''
  if (!rooms.value.includes(selectedRoom.value)) selectedRoom.value = rooms.value[0] || ''
}

async function fetchJson() {
  if (!inputJsonUrl.value) return
  try {
    const res = await fetch(inputJsonUrl.value)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const schedule = await res.json()
    processSchedule(schedule, inputJsonUrl.value.substring(inputJsonUrl.value.lastIndexOf('/') + 1) || inputJsonUrl.value)
  } catch (e) {
    alert('Failed to fetch JSON: ' + e.message)
  }
}

function importJson(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const schedule = JSON.parse(e.target.result)
      processSchedule(schedule, file.name)
    } catch (err) {
      alert('Invalid JSON file')
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

async function fetchStyle() {
  if (!inputStyleUrl.value) return
  try {
    const res = await fetch(inputStyleUrl.value)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const config = await res.json()
    dynamicStyleConfig.value = config
    loadedStyleName.value = inputStyleUrl.value.substring(inputStyleUrl.value.lastIndexOf('/') + 1) || inputStyleUrl.value
  } catch (e) {
    alert('Failed to fetch Style config: ' + e.message)
  }
}

function importStyleJson(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const config = JSON.parse(e.target.result)
      dynamicStyleConfig.value = config
      loadedStyleName.value = file.name
    } catch (err) {
      alert('Invalid Style JSON file')
    }
    event.target.value = ''
  }
  reader.readAsText(file)
}

function download() {
  if (!hasDateAndRoom.value) return
  
  if (dynamicSchedule.value && dynamicSvgHtml.value) {
    const blob = new Blob([dynamicSvgHtml.value], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedDate.value}-${selectedRoom.value}.svg`
    a.click()
    URL.revokeObjectURL(url)
  } else {
    const url = `./data/${selectedDate.value}-${selectedRoom.value}.svg`
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedDate.value}-${selectedRoom.value}.svg`
    a.click()
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto px-4 py-8" style="max-width: 1080px">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Opass Schedule to SVG</h1>
      <div class="flex gap-3">
        <button 
          @click="showUploadUI = !showUploadUI" 
          class="btn relative px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
            Import Custom Data
          </span>
        </button>
        <RouterLink to="/playground">
          <button class="btn inline-flex items-center gap-2 px-4 py-2 font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
            </svg>
            Playground
          </button>
        </RouterLink>
      </div>
    </div>

    <!-- Redesigned Upload Panel -->
    <div v-if="showUploadUI" class="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ease-in-out">
      <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-slate-800">Custom Data Import</h2>
          <p class="text-sm text-slate-500 mt-1">Upload your own JSON files to instantly preview changes below.</p>
        </div>
        <button @click="showUploadUI = false" class="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors" title="Close Panel">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex flex-col md:flex-row p-6 gap-8">
        <!-- Schedule Data Section -->
        <div class="flex-1 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
              Schedule Data
            </h3>
            <span v-if="loadedScheduleName !== '無'" class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 max-w-xs truncate" :title="loadedScheduleName">
              <svg class="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>
              <span class="truncate">{{ loadedScheduleName }}</span>
            </span>
          </div>
          
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-col gap-3">
              <div class="flex gap-2">
                <input type="text" v-model="inputJsonUrl" placeholder="https://example.com/schedule.json" class="flex-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3" />
                <button @click="fetchJson" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">Fetch</button>
              </div>
              <div class="relative flex items-center py-2">
                <div class="flex-grow border-t border-slate-200"></div>
                <span class="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">or</span>
                <div class="flex-grow border-t border-slate-200"></div>
              </div>
              <label class="group relative flex cursor-pointer justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-4 hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div class="text-center">
                  <svg class="mx-auto h-8 w-8 text-slate-300 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
                  </svg>
                  <div class="mt-2 text-sm font-semibold text-blue-600">Upload JSON file</div>
                  <input type="file" @change="importJson" accept=".json" class="sr-only" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="hidden md:block w-px bg-slate-200"></div>

        <!-- Style Config Section -->
        <div class="flex-1 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <span class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">2</span>
              Style Config <span class="text-sm font-normal text-slate-400 ml-1">(Optional)</span>
            </h3>
            <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 max-w-xs truncate" :title="loadedStyleName">
              <svg class="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" /></svg>
              <span class="truncate">{{ loadedStyleName }}</span>
            </span>
          </div>
          
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="flex flex-col gap-3">
              <div class="flex gap-2">
                <input type="text" v-model="inputStyleUrl" placeholder="https://example.com/style.config.json" class="flex-1 block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6 px-3" />
                <button @click="fetchStyle" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors">Fetch</button>
              </div>
              <div class="relative flex items-center py-2">
                <div class="flex-grow border-t border-slate-200"></div>
                <span class="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">or</span>
                <div class="flex-grow border-t border-slate-200"></div>
              </div>
              <label class="group relative flex cursor-pointer justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-4 hover:border-purple-500 hover:bg-purple-50 transition-all">
                <div class="text-center">
                  <svg class="mx-auto h-8 w-8 text-slate-300 group-hover:text-purple-500 transition-colors" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clip-rule="evenodd" />
                  </svg>
                  <div class="mt-2 text-sm font-semibold text-purple-600">Upload Config file</div>
                  <input type="file" @change="importStyleJson" accept=".json" class="sr-only" />
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
        <button @click="showUploadUI = false" class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-colors">
          Done & Preview
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <template v-if="dates.length > 0">
      <header class="mb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex-1">
            <div class="mb-3 flex flex-wrap gap-2">
              <button 
                v-for="date in dates" 
                :key="date" 
                @click="setDate(date)" 
                class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors border"
                :class="selectedDate === date ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'"
              >
                {{ date }}
              </button>
            </div>

            <div v-if="selectedDate" class="flex flex-wrap gap-2">
              <button 
                v-for="room in rooms" 
                :key="room" 
                @click="setRoom(room)" 
                class="rounded-full px-3 py-1 text-sm font-medium transition-colors border"
                :class="selectedRoom === room ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
              >
                {{ room }}
              </button>
            </div>
          </div>

          <div class="flex items-end self-end shrink-0">
            <button 
              v-if="hasDateAndRoom" 
              @click="download" 
              class="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Download SVG
            </button>
          </div>
        </div>
      </header>

      <div v-if="hasDateAndRoom" class="mt-4 rounded-xl border border-slate-200 bg-white shadow-md p-6 overflow-auto">
        <div v-if="dynamicSchedule" v-html="dynamicSvgHtml" class="dynamic-svg-container w-full flex justify-center"></div>
        <div v-else class="w-full flex justify-center">
          <img :src="`./data/${selectedDate}-${selectedRoom}.svg`" class="max-w-full rounded-lg shadow-sm" />
        </div>
      </div>
    </template>
    
    <div v-else-if="!showUploadUI" class="mt-12 text-center p-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50">
      <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="mt-2 text-sm font-semibold text-slate-900">No schedule data</h3>
      <p class="mt-1 text-sm text-slate-500">Please import custom data to get started.</p>
      <div class="mt-6">
        <button @click="showUploadUI = true" type="button" class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Import Custom Data
        </button>
      </div>
    </div>

  </div>
  </div>
</template>

<style>
.dynamic-svg-container svg {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>
