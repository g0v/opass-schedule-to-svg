<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { stringify } from 'svgson'
import { scheduleTemplate } from '~/template/scheduleTemplate.js'
import StyleInput from '~/components/StyleInput.vue'
import ControlGroup from '~/components/ControlGroup.vue'
import Control from '~/components/Control.vue'
import InputRange from '~/components/Form/InputRange.vue'
import InputText from '~/components/Form/InputText.vue'
import InputColor from '~/components/Form/InputColor.vue'
import InputCheckbox from '~/components/Form/InputCheckbox.vue'
import InputTextarea from '~/components/Form/InputTextarea.vue'
import InputBorderSides from '~/components/Form/InputBorderSides.vue'
import InputCorners from '~/components/Form/InputCorners.vue'
import InputSegmented from '~/components/Form/InputSegmented.vue'
import fallbackConfig from '../../style.config.json'
import { globalStore } from '../store.js'

// Mock Data
const mockSchedule = {
  speakers: [
    { id: 's1', zh: { name: '講者A' }, en: { name: 'Speaker A' } },
    { id: 's2', zh: { name: '講者B' }, en: { name: 'Speaker B' } },
  ],
}

const activeTitleTab = ref('zh')
const titleTabs = [
  { label: '中文標題', value: 'zh' },
  { label: '英文標題', value: 'en' },
]

const activeSectionTab = ref('layout')
const sectionTabs = [
  { label: '版面', value: 'layout', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
  { label: '時間', value: 'time', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: '議程', value: 'title', icon: 'M3 5h18M3 10h18M3 15h18M3 20h18' },
  { label: '講者', value: 'speaker', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

const activeTimeTab = ref('badge')
const timeTabs = [
  { label: '標籤樣式', value: 'badge' },
  { label: '文字樣式', value: 'text' },
]

const mockSessions = [
  {
    start: '2024-05-04T09:00:00+08:00',
    end: '2024-05-04T09:40:00+08:00',
    zh: { title: '開幕致詞' },
    en: { title: 'Opening Keynote' },
    speakers: ['s1'],
  },
  {
    start: '2024-05-04T10:00:00+08:00',
    end: '2024-05-04T11:00:00+08:00',
    zh: { title: '深入淺出 Web Components' },
    en: { title: 'Deep Dive into Web Components' },
    speakers: ['s1', 's2'],
  },
  {
    start: '2024-05-04T11:10:00+08:00',
    end: '2024-05-04T12:00:00+08:00',
    zh: { title: 'AI 對軟體工程的衝擊' },
    en: { title: 'Impact of AI on SE' },
    speakers: ['s2'],
  },
]

// Default Config (loaded from style.config.json initially)
let defaultConfig = {}
let baseConfig = {} // The 'reset target': user's uploaded style or system default (never working edits)
const config = ref(null)
let initialConfigStr = ''
const svgHtml = ref('')

function syncPlaygroundState() {
  if (!config.value) return

  const clonedConfig = JSON.parse(JSON.stringify(config.value))

  if (initialConfigStr && JSON.stringify(config.value) !== initialConfigStr) {
    globalStore.playgroundDraftStyle = clonedConfig
  } else {
    globalStore.playgroundDraftStyle = null
  }

  globalStore.playgroundWorkingConfig = clonedConfig
}

// Load initial config
onMounted(async () => {
  // baseConfig = the explicit user baseline (uploaded/fetched), NOT working edits
  // Persist it on first visit so it survives homepage confirm-sync
  if (globalStore.playgroundBaseConfig) {
    baseConfig = JSON.parse(JSON.stringify(globalStore.playgroundBaseConfig))
  } else if (globalStore.dynamicStyleConfig) {
    baseConfig = JSON.parse(JSON.stringify(globalStore.dynamicStyleConfig))
    globalStore.playgroundBaseConfig = JSON.parse(JSON.stringify(baseConfig)) // persist immediately
  } else {
    try {
      const res = await fetch('./data/style.config.json')
      if (!res.ok) throw new Error()
      baseConfig = await res.json()
    } catch (e) {
      console.warn('Failed to load config from fetch, using fallback')
      baseConfig = JSON.parse(JSON.stringify(fallbackConfig))
    }
    globalStore.playgroundBaseConfig = JSON.parse(JSON.stringify(baseConfig)) // persist immediately
  }

  // defaultConfig = what we actually load (could be user's last edits)
  if (globalStore.playgroundWorkingConfig) {
    defaultConfig = JSON.parse(JSON.stringify(globalStore.playgroundWorkingConfig))
  } else {
    defaultConfig = JSON.parse(JSON.stringify(baseConfig))
  }

  // Ensure defaults for backward compatibility
  if (defaultConfig.sessionBlock) {
    if (defaultConfig.sessionBlock.showTitle === undefined) {
      defaultConfig.sessionBlock.showTitle = true
    }
    if (defaultConfig.sessionBlock.timeBadge && defaultConfig.sessionBlock.timeBadge.show === undefined) {
      defaultConfig.sessionBlock.timeBadge.show = true
    }
    if (defaultConfig.sessionBlock.speaker && defaultConfig.sessionBlock.speaker.style === undefined) {
      defaultConfig.sessionBlock.speaker.style = ''
    }
    if (defaultConfig.sessionBlock.background) {
      if (!defaultConfig.sessionBlock.background.borderSides) {
        defaultConfig.sessionBlock.background.borderSides = ['top', 'bottom', 'left', 'right']
      }
      if (defaultConfig.sessionBlock.background.hasFill === undefined) {
        defaultConfig.sessionBlock.background.hasFill = true
      }
      if (defaultConfig.sessionBlock.background.hasStroke === undefined) {
        defaultConfig.sessionBlock.background.hasStroke = true
      }
      if (defaultConfig.sessionBlock.background.show === undefined) {
        defaultConfig.sessionBlock.background.show = true
      }
    }
    if (defaultConfig.sessionBlock.timeBadge) {
      if (defaultConfig.sessionBlock.timeBadge.hasFill === undefined) {
        defaultConfig.sessionBlock.timeBadge.hasFill = true
      }
      if (defaultConfig.sessionBlock.timeBadge.show === undefined) {
        defaultConfig.sessionBlock.timeBadge.show = true
      }
      if (defaultConfig.sessionBlock.timeBadge.yOffset === undefined) defaultConfig.sessionBlock.timeBadge.yOffset = 0
      if (defaultConfig.sessionBlock.timeBadge.roundedCorners === undefined) defaultConfig.sessionBlock.timeBadge.roundedCorners = ['tl', 'tr', 'br', 'bl']
    }
    if (defaultConfig.sessionBlock.titleZh) {
      if (defaultConfig.sessionBlock.titleZh.show === undefined) {
        defaultConfig.sessionBlock.titleZh.show = true
      }
    }
    if (defaultConfig.sessionBlock.titleEn) {
      if (defaultConfig.sessionBlock.titleEn.show === undefined) {
        defaultConfig.sessionBlock.titleEn.show = true
      }
    }
    if (defaultConfig.sessionBlock.speaker) {
      if (defaultConfig.sessionBlock.speaker.show === undefined) {
        defaultConfig.sessionBlock.speaker.show = true
      }
    }
    if (defaultConfig.sessionBlock.timeText) {
      if (defaultConfig.sessionBlock.timeText.show === undefined) {
        defaultConfig.sessionBlock.timeText.show = true
      }
    }
  }

  config.value = JSON.parse(JSON.stringify(defaultConfig))
  initialConfigStr = JSON.stringify(config.value)
})

// Watch config changes to regenerate SVG
watch(
  config,
  () => {
    if (!config.value) return
    try {
      // Generate SVG Object using the template
      const svgObj = scheduleTemplate(mockSchedule, mockSessions, config.value)
      // Convert to String using svgson (loaded via UMD script tag)
      svgHtml.value = stringify(svgObj)

      // Persist draft + working config so homepage can pick up edits on return.
      syncPlaygroundState()
    } catch (e) {
      console.error('Render error:', e)
    }
  },
  { deep: true }
)

// Guarantee saving working config when user navigates away (belt & suspenders with the watch)
onBeforeUnmount(() => {
  syncPlaygroundState()
})

const downloadConfig = () => {
  const blob = new Blob([JSON.stringify(config.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'style.config.json'
  a.click()
}

const downloadSVG = () => {
  const blob = new Blob([svgHtml.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'preview.svg'
  a.click()
}

const importConfig = event => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result)

      // Apply defaults for backward compatibility
      if (imported.sessionBlock) {
        if (imported.sessionBlock.timeBadge && imported.sessionBlock.timeBadge.show === undefined) {
          imported.sessionBlock.timeBadge.show = true
        }
        if (imported.sessionBlock.speaker && imported.sessionBlock.speaker.style === undefined) {
          imported.sessionBlock.speaker.style = ''
        }
        if (imported.sessionBlock.background && imported.sessionBlock.background.hasFill === undefined) {
          imported.sessionBlock.background.hasFill = true
        }
        if (imported.sessionBlock.background && imported.sessionBlock.background.hasStroke === undefined) {
          imported.sessionBlock.background.hasStroke = true
        }
        if (imported.sessionBlock.timeBadge && imported.sessionBlock.timeBadge.hasFill === undefined) {
          imported.sessionBlock.timeBadge.hasFill = true
        }
      }

      config.value = imported
      // Update the base config so reset goes back to THIS uploaded file
      globalStore.playgroundBaseConfig = JSON.parse(JSON.stringify(imported))
      baseConfig = JSON.parse(JSON.stringify(imported))
      console.log('Config imported successfully')
      // Clear the value so the same file can be imported again
      event.target.value = ''
    } catch (err) {
      console.error('Import error:', err)
      alert('Invalid JSON file')
      event.target.value = ''
    }
  }
  reader.readAsText(file)
}

const resetConfig = () => {
  if (!confirm('確定要重置所有設定嗎？')) return
  config.value = JSON.parse(JSON.stringify(baseConfig))
  // Clear working config so next visit also starts from base
  globalStore.playgroundWorkingConfig = null
}

const syncFromHomepage = () => {
  if (!globalStore.dynamicStyleConfig) {
    alert('首頁目前沒有自訂樣式可供同步。')
    return
  }
  if (!confirm('將會套用目前首頁正在使用的樣式，確定要覆蓋目前的編輯嗎？')) return
  config.value = JSON.parse(JSON.stringify(globalStore.dynamicStyleConfig))
}

const resetKeys = paths => {
  // Check if confirm is needed or make it subtle. User requested icon, usually means quick reset.
  // But to be safe, confirm is good.
  if (!confirm('確定要重置此區塊設定嗎？')) return

  paths.forEach(path => {
    const parts = path.split('.')
    let current = config.value
    let source = baseConfig

    // Navigate to parent of the target key
    let valid = true
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined || source[parts[i]] === undefined) {
        valid = false
        break
      }
      current = current[parts[i]]
      source = source[parts[i]]
    }

    if (valid) {
      const lastKey = parts[parts.length - 1]
      if (source[lastKey] !== undefined) {
        current[lastKey] = JSON.parse(JSON.stringify(source[lastKey]))
      }
    }
  })
}

const defaultFontOptions = [
  { label: 'Liberation Sans / Arial', value: "'Liberation Sans', Arial, sans-serif" },
  { label: '思源黑體', value: "'NotoSansTC-Regular', 'Noto Sans TC', sans-serif" },
  { label: '思源宋體', value: "'Noto Serif TC', serif" },
  { label: '蘋方 / 微軟正黑體', value: 'sans-serif' },
  { label: '標楷體', value: "'Kaiti TC', 'KaiTi', STKaiti, serif" },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: '等寬字型', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  { label: '系統預設介面字型', value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" },
]

const fontOptions = ref([...defaultFontOptions])

const useLocalFonts = ref(false)
const isLocalFontsBlocked = ref(false)

onMounted(async () => {
  if ('permissions' in navigator && 'query' in navigator.permissions) {
    try {
      const p = await navigator.permissions.query({ name: 'local-fonts' })
      isLocalFontsBlocked.value = p.state === 'denied'
      p.onchange = () => {
        isLocalFontsBlocked.value = p.state === 'denied'
        if (p.state !== 'granted') {
          useLocalFonts.value = false
          fontOptions.value = [...defaultFontOptions]
          localStorage.setItem('opass_use_local_fonts', 'false')
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (localStorage.getItem('opass_use_local_fonts') === 'true' && !isLocalFontsBlocked.value) {
    await performLoadLocalFonts(true)
  }
})
const toggleLocalFonts = async () => {
  if (useLocalFonts.value) {
    useLocalFonts.value = false
    fontOptions.value = [...defaultFontOptions]
    localStorage.setItem('opass_use_local_fonts', 'false')
    return
  }

  if (!('queryLocalFonts' in window)) {
    alert('您的瀏覽器不支援讀取本機字型功能。請使用最新版的 Chrome 或 Edge。')
    return
  }

  await performLoadLocalFonts(false)
}

const performLoadLocalFonts = async (isAutoLoad = false) => {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'local-fonts' })
        if (permission.state === 'denied') {
          isLocalFontsBlocked.value = true
          if (!isAutoLoad) alert('您已經拒絕存取本機字型，請至瀏覽器網址列左側的設定中開啟權限。')
          return
        }
        if (isAutoLoad && permission.state !== 'granted') {
          return // 防止自動載入時觸發瀏覽器視窗干擾使用者
        }
      } catch (e) {
        if (isAutoLoad) return
      }
    } else if (isAutoLoad) {
      return
    }

    const fonts = await window.queryLocalFonts()
    if (!fonts || fonts.length === 0) {
      return
    }

    const uniqueFonts = new Set()
    const localFontOptions = []

    fonts.forEach(font => {
      if (!uniqueFonts.has(font.family)) {
        uniqueFonts.add(font.family)
        localFontOptions.push({
          label: `本機: ${font.family}`,
          value: `'${font.family}'`,
        })
      }
    })

    fontOptions.value = [...defaultFontOptions, { label: '--- 以下為本機字型 ---', value: '', disabled: true }, ...localFontOptions]
    useLocalFonts.value = true
    localStorage.setItem('opass_use_local_fonts', 'true')
  } catch (err) {
    if (!isAutoLoad) alert('讀取本機字型失敗：可能是因為尚未取得權限，請確認瀏覽器提示。')
    console.error(err)
  }
}

const weightOptions = [
  { label: '100 - Thin', value: '100' },
  { label: '200 - Extra Light', value: '200' },
  { label: '300 - Light', value: '300' },
  { label: '400 - Regular', value: '400' },
  { label: '500 - Medium', value: '500' },
  { label: '600 - SemiBold', value: '600' },
  { label: '700 - Bold', value: '700' },
  { label: '800 - Extra Bold', value: '800' },
  { label: '900 - Black', value: '900' },
]

const fillOptions = [
  { label: '填色', value: true },
  { label: '透明', value: false },
]
</script>

<template>
  <div class="flex">
    <div class="z-10 flex h-screen shrink-0 flex-col border border-slate-300 shadow-xl" style="width: 400px;">
      <div class="p-6 pb-0">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <RouterLink
              to="/"
              class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-gray-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-gray-900 active:scale-95"
              title="返回首頁"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </RouterLink>
            <h2 class="text-xl font-bold text-gray-900">SVG Playground</h2>
          </div>
          <button class="btn text-xs" @click="syncFromHomepage" :disabled="!globalStore.dynamicStyleConfig" title="同步首頁目前的樣式">同步首頁</button>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <!-- Download Config (Style) -->
          <button class="btn btn-square-icon" @click="downloadConfig" title="導出樣式設定檔 (JSON)">
            <svg class="w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9Z"
              />
            </svg>
          </button>
          <!-- Download SVG (Image) -->
          <button class="btn btn-square-icon" @click="downloadSVG" title="導出圖檔 (SVG)">
            <svg class="w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </button>
          <!-- Import Config -->
          <label class="btn btn-square-icon" for="config-import" title="匯入樣式設定檔">
            <svg class="w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            <input id="config-import" type="file" @change="importConfig" accept=".json" style="display: none" />
          </label>
          <!-- Reset All -->
          <button class="btn btn-square-icon" @click="resetConfig" title="全部重置">
            <svg class="w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div class="mt-4 flex items-center justify-between border-y border-slate-100 py-2 px-1">
          <div class="flex items-center gap-2">
            <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
            <span class="text-[10px] font-medium text-slate-500 uppercase tracking-wider">本機字型</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="isLocalFontsBlocked" class="text-[9px] text-amber-500 font-bold">需要權限 ⚠️</span>
            <button 
              @click="toggleLocalFonts"
              class="relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out"
              :class="useLocalFonts ? 'bg-blue-500' : 'bg-slate-200'"
            >
              <span 
                class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5"
                :class="useLocalFonts ? 'translate-x-3.5' : 'translate-x-0.5'"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Bar (Sticky/Fixed below header) -->
      <div class="border-b border-slate-200 bg-white px-6 py-2">
        <div class="flex justify-between gap-1">
          <button
            v-for="tab in sectionTabs"
            :key="tab.value"
            @click="activeSectionTab = tab.value"
            class="flex flex-col items-center gap-1 grow rounded-lg py-2 transition-all"
            :class="activeSectionTab === tab.value ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
            </svg>
            <span class="text-[10px] font-bold">{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Property Content Area (Scrollable) -->
      <div class="grow overflow-y-auto p-6 flex flex-col gap-6" style="scrollbar-gutter: stable;">

      <!-- Global Layout -->
      <ControlGroup v-if="config && activeSectionTab === 'layout'" title="版面設定" @reset="resetKeys(['rowHeight', 'svgWidth'])">
        <Control title="行高">
          <InputRange :min="50" :max="300" v-model.number="config.rowHeight" />
          <InputText isNumber v-model.number="config.rowHeight" />
        </Control>
        <Control title="寬度">
          <InputRange :min="300" :max="2000" v-model.number="config.svgWidth" />
          <InputText isNumber v-model.number="config.svgWidth" />
        </Control>
      </ControlGroup>

      <!-- Session Block Layout (Merged) -->
      <ControlGroup v-if="config && activeSectionTab === 'layout'" title="議程區塊樣式" v-model:show="config.sessionBlock.background.show" @reset="resetKeys(['sessionBlock.background'])">
        <Control title="背景顏色">
          <InputColor v-model="config.sessionBlock.background.fill" v-model:hasValue="config.sessionBlock.background.hasFill" />
          <InputText v-model="config.sessionBlock.background.fill" :disabled="!config.sessionBlock.background.hasFill" />
        </Control>
        <Control title="邊框顏色">
          <InputColor v-model="config.sessionBlock.background.stroke" v-model:hasValue="config.sessionBlock.background.hasStroke" />
          <InputText v-model="config.sessionBlock.background.stroke" :disabled="!config.sessionBlock.background.hasStroke" />
        </Control>
        <Control title="邊框顯示">
          <InputBorderSides v-model="config.sessionBlock.background.borderSides" :disabled="!config.sessionBlock.background.hasStroke" />
        </Control>
      </ControlGroup>


      <!-- Time Badge Section -->
      <ControlGroup v-if="config && activeSectionTab === 'time'" title="時間標籤區塊" v-model:show="config.sessionBlock.timeBadge.show" @reset="resetKeys(['sessionBlock.timeBadge', 'sessionBlock.timeText'])">
        <div class="space-y-4">
          <InputSegmented 
            v-model="activeTimeTab" 
            :options="[
              { label: '標籤樣式', value: 'badge' },
              { 
                label: '文字樣式', 
                value: 'text'
              }
            ]" 
          />
          
          <div class="min-h-[300px] border-t border-slate-50 pt-5">
            <!-- Badge Style Panel -->
            <div v-if="activeTimeTab === 'badge'" class="space-y-4">
              <Control title="背景顏色">
                <InputColor v-model="config.sessionBlock.timeBadge.fill" v-model:hasValue="config.sessionBlock.timeBadge.hasFill" />
                <InputText v-model="config.sessionBlock.timeBadge.fill" :disabled="!config.sessionBlock.timeBadge.hasFill" />
              </Control>
              <Control title="X 座標">
                <InputRange :min="0" :max="500" :step="0.1" v-model.number="config.sessionBlock.timeBadge.x" />
                <InputText isNumber :step="0.1" v-model.number="config.sessionBlock.timeBadge.x" />
              </Control>
              <Control title="Y 偏移">
                <InputRange :min="-100" :max="100" :step="1" v-model.number="config.sessionBlock.timeBadge.yOffset" />
                <InputText isNumber v-model.number="config.sessionBlock.timeBadge.yOffset" />
              </Control>
              <Control title="寬度">
                <InputRange :min="10" :max="300" :step="0.1" v-model.number="config.sessionBlock.timeBadge.width" />
                <InputText isNumber :step="0.1" v-model.number="config.sessionBlock.timeBadge.width" />
              </Control>
              <Control title="高度">
                <InputRange :min="10" :max="100" :step="0.1" v-model.number="config.sessionBlock.timeBadge.height" />
                <InputText isNumber :step="0.1" v-model.number="config.sessionBlock.timeBadge.height" />
              </Control>
              <Control title="圓角位置">
                <InputCorners v-model="config.sessionBlock.timeBadge.roundedCorners" />
              </Control>
              <Control title="圓角 RX">
                <InputRange :min="0" :max="50" v-model.number="config.sessionBlock.timeBadge.rx" />
                <InputText isNumber v-model.number="config.sessionBlock.timeBadge.rx" />
              </Control>
              <Control title="圓角 RY">
                <InputRange :min="0" :max="50" v-model.number="config.sessionBlock.timeBadge.ry" />
                <InputText isNumber v-model.number="config.sessionBlock.timeBadge.ry" />
              </Control>
            </div>

            <!-- Text Style Panel -->
            <div v-if="activeTimeTab === 'text'" class="space-y-4">
              <StyleInput :obj="config.sessionBlock.timeText" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
              <StyleInput :obj="config.sessionBlock.timeText" prop="fill" type="color" label="文字顏色" />
              <StyleInput :obj="config.sessionBlock.timeText" prop="font-family" type="select" :options="fontOptions" label="字型" />
              <StyleInput :obj="config.sessionBlock.timeText" prop="font-weight" type="select" :options="weightOptions" label="字重" />
            </div>
          </div>
        </div>
      </ControlGroup>

      <!-- Session Title Section -->
      <ControlGroup v-if="config && activeSectionTab === 'title'" title="議程名字區塊" v-model:show="config.sessionBlock.showTitle" @reset="resetKeys(['sessionBlock.titleZh', 'sessionBlock.titleEn'])">
        <div class="space-y-4">
          <!-- Premium Tab Switcher -->
          <InputSegmented 
            v-model="activeTitleTab" 
            :options="[
              { 
                label: '中文標題', 
                value: 'zh',
                show: config.sessionBlock.titleZh.show,
                onToggle: () => config.sessionBlock.titleZh.show = !config.sessionBlock.titleZh.show
              },
              { 
                label: '英文標題', 
                value: 'en',
                show: config.sessionBlock.titleEn.show,
                onToggle: () => config.sessionBlock.titleEn.show = !config.sessionBlock.titleEn.show
              }
            ]" 
          />
          
          <div class="min-h-[300px] border-t border-slate-50 pt-5">
            <!-- Zh Panel -->
            <div v-if="activeTitleTab === 'zh'" class="space-y-4" :class="{ 'opacity-40 pointer-events-none grayscale-[0.5]': !config.sessionBlock.titleZh.show }">
              <StyleInput :obj="config.sessionBlock.titleZh" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
              <StyleInput :obj="config.sessionBlock.titleZh" prop="fill" type="color" label="文字顏色" />
              <StyleInput :obj="config.sessionBlock.titleZh" prop="font-family" type="select" :options="fontOptions" label="字型" />
              <StyleInput :obj="config.sessionBlock.titleZh" prop="font-weight" type="select" :options="weightOptions" label="字重" />
              <Control title="X 座標">
                <InputRange :min="0" :max="800" v-model.number="config.sessionBlock.titleZh.x" />
                <InputText isNumber v-model.number="config.sessionBlock.titleZh.x" />
              </Control>
              <Control title="Y 位移">
                <InputRange :min="0" :max="150" v-model.number="config.sessionBlock.titleZh.yOffset" />
                <InputText isNumber v-model.number="config.sessionBlock.titleZh.yOffset" />
              </Control>
            </div>

            <!-- En Panel -->
            <div v-if="activeTitleTab === 'en'" class="space-y-4" :class="{ 'opacity-40 pointer-events-none grayscale-[0.5]': !config.sessionBlock.titleEn.show }">
              <StyleInput :obj="config.sessionBlock.titleEn" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
              <StyleInput :obj="config.sessionBlock.titleEn" prop="fill" type="color" label="文字顏色" />
              <StyleInput :obj="config.sessionBlock.titleEn" prop="font-family" type="select" :options="fontOptions" label="字型" />
              <StyleInput :obj="config.sessionBlock.titleEn" prop="font-weight" type="select" :options="weightOptions" label="字重" />
              <Control title="X 座標">
                <InputRange :min="0" :max="800" v-model.number="config.sessionBlock.titleEn.x" />
                <InputText isNumber v-model.number="config.sessionBlock.titleEn.x" />
              </Control>
              <Control title="Y 位移">
                <InputRange :min="0" :max="150" v-model.number="config.sessionBlock.titleEn.yOffset" />
                <InputText isNumber v-model.number="config.sessionBlock.titleEn.yOffset" />
              </Control>
            </div>

            <!-- Empty State Warning when hidden -->
            <div v-if="(activeTitleTab === 'zh' && !config.sessionBlock.titleZh.show) || (activeTitleTab === 'en' && !config.sessionBlock.titleEn.show)" class="py-4 text-center">
               <p class="text-[10px] text-slate-400">目前已隱藏{{ activeTitleTab === 'zh' ? '中文' : '英文' }}標題，點擊上方眼睛圖示開啟</p>
            </div>
          </div>
        </div>
      </ControlGroup>

      <!-- Speaker Section -->
      <ControlGroup v-if="config && activeSectionTab === 'speaker'" title="講者區塊" v-model:show="config.sessionBlock.speaker.show" @reset="resetKeys(['sessionBlock.speaker'])">
        <StyleInput :obj="config.sessionBlock.speaker" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
        <StyleInput :obj="config.sessionBlock.speaker" prop="fill" type="color" label="文字顏色" />
        <StyleInput :obj="config.sessionBlock.speaker" prop="font-family" type="select" :options="fontOptions" label="字型" />
        <StyleInput :obj="config.sessionBlock.speaker" prop="font-weight" type="select" :options="weightOptions" label="字重" />
        <Control title="X 座標">
          <InputRange :min="0" :max="1000" v-model.number="config.sessionBlock.speaker.x" />
          <InputText isNumber v-model.number="config.sessionBlock.speaker.x" />
        </Control>
        <Control title="行高">
          <InputRange :min="10" :max="60" v-model.number="config.sessionBlock.speaker.lineHeight" />
          <InputText isNumber v-model.number="config.sessionBlock.speaker.lineHeight" />
        </Control>
        <Control title="DY">
          <InputRange :min="10" :max="60" v-model.number="config.sessionBlock.speaker.dy" />
          <InputText isNumber v-model.number="config.sessionBlock.speaker.dy" />
        </Control>
        <Control title="Y 邊距">
          <InputRange :min="0" :max="50" v-model.number="config.sessionBlock.speaker.yPadding" />
          <InputText isNumber v-model.number="config.sessionBlock.speaker.yPadding" />
        </Control>
      </ControlGroup>

      <ControlGroup v-if="config && activeSectionTab === 'layout'" title="CSS 樣式" @reset="resetKeys(['css'])">
        <InputTextarea v-model="config.css" />
      </ControlGroup>
      </div>
    </div>

    <div class="h-screen grow overflow-auto bg-gray-100 p-6">
      <div class="playground-preview max-w-full bg-white shadow-lg" v-html="svgHtml"></div>
    </div>
  </div>
</template>

<style>
.playground-preview svg {
  width: 100%;
}
</style>
