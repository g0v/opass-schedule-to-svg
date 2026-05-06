<script setup>
import { ref, computed, onMounted, watch, toRefs } from 'vue'
import { stringify } from 'svgson'
import JSZip from 'jszip'
import { scheduleTemplate } from '~/template/scheduleTemplate.js'
import { formatDate } from '../../utils/formatDate.js'
import fallbackConfig from '../../style.config.json'
import { globalStore } from '../store.js'

const isZipping = ref(false)

const { dates, rooms, selectedDate, selectedRoom, showUploadUI, inputJsonUrl, inputStyleUrl, dynamicSchedule, dynamicStyleConfig, loadedScheduleName, loadedStyleName } = toRefs(globalStore)

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

  if (dynamicSchedule.value) {
    showUploadUI.value = false
    return // Already loaded from store
  }
  try {
    const [scheduleRes, configRes] = await Promise.allSettled([
      fetch('./data/schedule.json').then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      }),
      fetch('./data/style.config.json').then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      }),
    ])

    if (scheduleRes.status === 'fulfilled') {
      processSchedule(scheduleRes.value, '預設資料')
    }
    if (configRes.status === 'fulfilled') {
      if (!dynamicStyleConfig.value) dynamicStyleConfig.value = configRes.value
    } else {
      if (!dynamicStyleConfig.value) dynamicStyleConfig.value = fallbackConfig
    }

    if (!dynamicSchedule.value || dates.value.length === 0) {
      showUploadUI.value = true
      loadedScheduleName.value = '無'
    }
  } catch (e) {
    console.error('Failed to load initial data:', e)
    showUploadUI.value = true
    if (!dynamicStyleConfig.value) dynamicStyleConfig.value = fallbackConfig
    loadedScheduleName.value = '無'
  }
})

watch(
  [selectedDate, selectedRoom, dynamicSchedule, dynamicStyleConfig],
  () => {
    if (!dynamicSchedule.value || !hasDateAndRoom.value || !dynamicStyleConfig.value) return
    try {
      const sessions = dynamicSchedule.value.sessions.filter(s => formatDate(s.start) === selectedDate.value && s.room === selectedRoom.value)
      sessions.sort((a, b) => new Date(a.start) - new Date(b.start))
      const svgObj = scheduleTemplate(dynamicSchedule.value, sessions, dynamicStyleConfig.value)
      dynamicSvgHtml.value = stringify(svgObj)
    } catch (e) {
      console.error('Render error:', e)
    }
  },
  { deep: true, immediate: true }
) // Added immediate true to render on mount

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

const lastFetchedJsonUrl = ref('')
const lastFetchedStyleUrl = ref('')

async function fetchJson() {
  if (!inputJsonUrl.value) return
  try {
    const res = await fetch(inputJsonUrl.value)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const schedule = await res.json()
    processSchedule(schedule, inputJsonUrl.value.substring(inputJsonUrl.value.lastIndexOf('/') + 1) || inputJsonUrl.value)
    lastFetchedJsonUrl.value = inputJsonUrl.value
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
    lastFetchedStyleUrl.value = inputStyleUrl.value
  } catch (e) {
    alert('Failed to fetch Style config: ' + e.message)
  }
}

async function handleDone() {
  const promises = []
  if (inputJsonUrl.value && inputJsonUrl.value !== lastFetchedJsonUrl.value) {
    promises.push(fetchJson())
  }
  if (inputStyleUrl.value && inputStyleUrl.value !== lastFetchedStyleUrl.value) {
    promises.push(fetchStyle())
  }
  if (promises.length > 0) {
    await Promise.allSettled(promises)
  }
  showUploadUI.value = false
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
async function downloadAll() {
  if (isZipping.value) return
  isZipping.value = true

  try {
    const zip = new JSZip()

    // Add style config
    if (dynamicStyleConfig.value) {
      zip.file('style.config.json', JSON.stringify(dynamicStyleConfig.value, null, 2))
    }

    if (!dynamicSchedule.value || !dynamicStyleConfig.value) {
      throw new Error('目前沒有可供匯出的議程或樣式資料')
    }

    // Render every SVG from the current schedule + style config instead of reusing static assets.
    for (const date of dates.value) {
      for (const room of rooms.value) {
        const sessions = dynamicSchedule.value.sessions.filter(s => formatDate(s.start) === date && s.room === room)
        if (sessions.length > 0) {
          const sortedSessions = sessions.sort((a, b) => new Date(a.start) - new Date(b.start))
          const svgObj = scheduleTemplate(dynamicSchedule.value, sortedSessions, dynamicStyleConfig.value)
          const svgString = stringify(svgObj)
          zip.file(`${date}-${room}.svg`, svgString)
        }
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'opass-schedules.zip'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to generate zip:', error)
    alert('打包失敗：' + error.message)
  } finally {
    isZipping.value = false
  }
}

function download() {
  if (!hasDateAndRoom.value || !dynamicSchedule.value || !dynamicStyleConfig.value || !dynamicSvgHtml.value) return

  const blob = new Blob([dynamicSvgHtml.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedDate.value}-${selectedRoom.value}.svg`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto px-4 py-8" style="max-width: 1080px">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Opass Schedule to SVG</h1>
        <div class="flex gap-3">
          <button
            @click="showUploadUI = !showUploadUI"
            class="btn relative rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
          >
            <span class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clip-rule="evenodd"
                />
              </svg>
              Import Custom Data
            </span>
          </button>
          <RouterLink to="/playground">
            <button
              class="btn inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                  clip-rule="evenodd"
                />
              </svg>
              Playground
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Redesigned Upload Panel -->
      <div v-if="showUploadUI" class="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ease-in-out">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h2 class="text-xl font-bold text-slate-800">Custom Data Import</h2>
            <p class="mt-1 text-sm text-slate-500">Upload your own JSON files to instantly preview changes below.</p>
          </div>
          <button @click="showUploadUI = false" class="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600" title="Close Panel">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col gap-8 p-6 md:flex-row">
          <!-- Schedule Data Section -->
          <div class="flex-1 space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                Schedule Data
              </h3>
              <span
                v-if="loadedScheduleName !== '無'"
                class="inline-flex max-w-xs items-center gap-1 truncate rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset"
                :title="loadedScheduleName"
              >
                <svg class="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="truncate">{{ loadedScheduleName }}</span>
              </span>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex flex-col gap-3">
                <div class="flex gap-2">
                  <input
                    type="text"
                    v-model="inputJsonUrl"
                    placeholder="https://example.com/schedule.json"
                    class="block w-full flex-1 rounded-md border-0 px-3 py-1.5 text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:ring-inset sm:text-sm sm:leading-6"
                  />
                  <button @click="fetchJson" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 transition-colors ring-inset hover:bg-slate-50">
                    Fetch
                  </button>
                </div>
                <div class="relative flex items-center py-2">
                  <div class="flex-grow border-t border-slate-200"></div>
                  <span class="mx-4 flex-shrink-0 text-xs font-medium text-slate-400 uppercase">or</span>
                  <div class="flex-grow border-t border-slate-200"></div>
                </div>
                <label
                  class="group relative flex cursor-pointer justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-4 transition-all hover:border-blue-500 hover:bg-blue-50"
                >
                  <div class="text-center">
                    <svg class="mx-auto h-8 w-8 text-slate-300 transition-colors group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        fill-rule="evenodd"
                        d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <div class="mt-2 text-sm font-semibold text-blue-600">Upload JSON file</div>
                    <input type="file" @change="importJson" accept=".json" class="sr-only" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div class="hidden w-px bg-slate-200 md:block"></div>

          <!-- Style Config Section -->
          <div class="flex-1 space-y-5">
            <div class="flex items-center justify-between">
              <h3 class="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">2</span>
                Style Config <span class="ml-1 text-sm font-normal text-slate-400">(Optional)</span>
              </h3>
              <span
                class="inline-flex max-w-xs items-center gap-1 truncate rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20 ring-inset"
                :title="loadedStyleName"
              >
                <svg class="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="truncate">{{ loadedStyleName }}</span>
              </span>
            </div>

            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div class="flex flex-col gap-3">
                <div class="flex gap-2">
                  <input
                    type="text"
                    v-model="inputStyleUrl"
                    placeholder="https://example.com/style.config.json"
                    class="block w-full flex-1 rounded-md border-0 px-3 py-1.5 text-slate-900 shadow-sm ring-1 ring-slate-300 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:ring-inset sm:text-sm sm:leading-6"
                  />
                  <button @click="fetchStyle" class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 transition-colors ring-inset hover:bg-slate-50">
                    Fetch
                  </button>
                </div>
                <div class="relative flex items-center py-2">
                  <div class="flex-grow border-t border-slate-200"></div>
                  <span class="mx-4 flex-shrink-0 text-xs font-medium text-slate-400 uppercase">or</span>
                  <div class="flex-grow border-t border-slate-200"></div>
                </div>
                <label
                  class="group relative flex cursor-pointer justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-4 transition-all hover:border-purple-500 hover:bg-purple-50"
                >
                  <div class="text-center">
                    <svg class="mx-auto h-8 w-8 text-slate-300 transition-colors group-hover:text-purple-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path
                        fill-rule="evenodd"
                        d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <div class="mt-2 text-sm font-semibold text-purple-600">Upload Config file</div>
                    <input type="file" @change="importStyleJson" accept=".json" class="sr-only" />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            @click="handleDone"
            class="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
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
                  class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
                  :class="selectedDate === date ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
                >
                  {{ date }}
                </button>
              </div>

              <div v-if="selectedDate" class="flex flex-wrap gap-2">
                <button
                  v-for="room in rooms"
                  :key="room"
                  @click="setRoom(room)"
                  class="rounded-full border px-3 py-1 text-sm font-medium transition-colors"
                  :class="selectedRoom === room ? 'border-blue-200 bg-blue-100 text-blue-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                >
                  {{ room }}
                </button>
              </div>
            </div>

            <div class="flex shrink-0 items-end gap-3 self-end">
              <button
                v-if="dates.length > 0"
                @click="downloadAll"
                :disabled="isZipping"
                class="inline-flex transform items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-lg focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:shadow-md"
              >
                <svg v-if="!isZipping" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg v-else class="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isZipping ? '打包中...' : 'Download All' }}
              </button>
              <button
                v-if="hasDateAndRoom"
                @click="download"
                class="inline-flex transform items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                Download SVG
              </button>
            </div>
          </div>
        </header>

        <div v-if="hasDateAndRoom && dynamicSchedule" class="mt-4 overflow-auto rounded-xl border border-slate-200 bg-white p-6 shadow-md">
          <div v-html="dynamicSvgHtml" class="dynamic-svg-container flex w-full justify-center"></div>
        </div>
      </template>

      <div v-else-if="!showUploadUI" class="mt-12 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-slate-900">No schedule data</h3>
        <p class="mt-1 text-sm text-slate-500">Please import custom data to get started.</p>
        <div class="mt-6">
          <button
            @click="showUploadUI = true"
            type="button"
            class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <svg class="mr-1.5 -ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
