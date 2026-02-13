<script setup>
import { ref, onMounted, watch } from 'vue'
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

// Mock Data
const mockSchedule = {
  speakers: [
    { id: 's1', zh: { name: '講者A' }, en: { name: 'Speaker A' } },
    { id: 's2', zh: { name: '講者B' }, en: { name: 'Speaker B' } },
  ],
}

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
const config = ref(null)
const svgHtml = ref('')

// Load initial config
onMounted(async () => {
  try {
    const res = await fetch('./data/style.config.json')
    defaultConfig = await res.json()

    // Ensure defaults for backward compatibility
    if (defaultConfig.sessionBlock) {
      if (defaultConfig.sessionBlock.timeBadge && defaultConfig.sessionBlock.timeBadge.show === undefined) {
        defaultConfig.sessionBlock.timeBadge.show = true
      }
      if (defaultConfig.sessionBlock.speaker && defaultConfig.sessionBlock.speaker.style === undefined) {
        defaultConfig.sessionBlock.speaker.style = ''
      }
    }

    config.value = JSON.parse(JSON.stringify(defaultConfig))
  } catch (e) {
    console.error('Failed to load config', e)
  }
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
    } catch (e) {
      console.error('Render error:', e)
    }
  },
  { deep: true }
)

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
      }

      config.value = imported
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
  config.value = JSON.parse(JSON.stringify(defaultConfig))
}

const resetKeys = paths => {
  // Check if confirm is needed or make it subtle. User requested icon, usually means quick reset.
  // But to be safe, confirm is good.
  if (!confirm('確定要重置此區塊設定嗎？')) return

  paths.forEach(path => {
    const parts = path.split('.')
    let current = config.value
    let source = defaultConfig

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

const fontOptions = [
  { label: 'Onest', value: "'Onest-Regular_SemiBold', 'Onest-Regular_Regular', 'Onest', sans-serif" },
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
</script>

<template>
  <div class="flex">
    <div class="z-10 flex h-screen shrink-0 flex-col gap-6 overflow-y-auto border border-slate-300 p-6 shadow-xl" style="width: 400px">
      <div>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">SVG Playground</h2>
          <RouterLink to="/">
            <button class="btn text-xs">回首頁</button>
          </RouterLink>
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
      </div>

      <!-- Global Layout -->
      <ControlGroup v-if="config" title="版面設定" @reset="resetKeys(['rowHeight', 'svgWidth'])">
        <Control title="行高">
          <InputRange :min="50" :max="300" v-model.number="config.rowHeight" />
          <InputText isNumber v-model.number="config.rowHeight" />
        </Control>
        <Control title="寬度">
          <InputRange :min="300" :max="2000" v-model.number="config.svgWidth" />
          <InputText isNumber v-model.number="config.svgWidth" />
        </Control>
      </ControlGroup>

      <!-- Session Block Layout -->
      <ControlGroup v-if="config" title="議程區塊樣式" @reset="resetKeys(['sessionBlock.background'])">
        <Control title="背景顏色">
          <InputColor v-model="config.sessionBlock.background.fill" />
          <InputText v-model="config.sessionBlock.background.fill" />
        </Control>
        <Control title="邊框顏色">
          <InputColor v-model="config.sessionBlock.background.stroke" />
          <InputText v-model="config.sessionBlock.background.stroke" />
        </Control>
      </ControlGroup>

      <!-- Time Badge Section -->
      <ControlGroup v-if="config" title="時間標籤區塊" @reset="resetKeys(['sessionBlock.timeBadge', 'sessionBlock.timeText'])">
        <Control title="標籤樣式">
          <InputCheckbox v-model="config.sessionBlock.timeBadge.show" />
        </Control>

        <template v-if="config.sessionBlock.timeBadge.show !== false">
          <Control title="背景顏色">
            <InputColor v-model="config.sessionBlock.timeBadge.fill" />
            <InputText v-model="config.sessionBlock.timeBadge.fill" />
          </Control>
          <Control title="X 座標">
            <InputRange :min="0" :max="500" :step="0.1" v-model.number="config.sessionBlock.timeBadge.x" />
            <InputText isNumber :step="0.1" v-model.number="config.sessionBlock.timeBadge.x" />
          </Control>
          <Control title="寬度">
            <InputRange :min="10" :max="300" :step="0.1" v-model.number="config.sessionBlock.timeBadge.width" />
            <InputText isNumber :step="0.1" v-model.number="config.sessionBlock.timeBadge.width" />
          </Control>
          <Control title="高度">
            <InputRange :min="10" :max="100" :step="0.1" v-model.number="config.sessionBlock.timeBadge.height" />
            <InputText isNumber :step="0.1" v-model.number="config.sessionBlock.timeBadge.height" />
          </Control>
          <Control title="圓角 RX">
            <InputRange :min="0" :max="50" v-model.number="config.sessionBlock.timeBadge.rx" />
            <InputText isNumber v-model.number="config.sessionBlock.timeBadge.rx" />
          </Control>
          <Control title="圓角 RY">
            <InputRange :min="0" :max="50" v-model.number="config.sessionBlock.timeBadge.ry" />
            <InputText isNumber v-model.number="config.sessionBlock.timeBadge.ry" />
          </Control>
        </template>
      </ControlGroup>

      <!-- Session Title Section -->
      <ControlGroup v-if="config" title="議程名字區塊" @reset="resetKeys(['sessionBlock.titleZh', 'sessionBlock.titleEn'])">
        <h4 class="mb-3 shrink-0 text-sm font-bold text-gray-600">中文標題 (Zh)</h4>
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

        <h4 class="mb-3 shrink-0 text-sm font-bold text-gray-600">英文標題 (En)</h4>
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
      </ControlGroup>

      <!-- Speaker Section -->
      <ControlGroup v-if="config" title="講者區塊" @reset="resetKeys(['sessionBlock.speaker'])">
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

      <ControlGroup v-if="config" title="CSS 樣式" @reset="resetKeys(['css'])">
        <InputTextarea v-model="config.css" />
      </ControlGroup>
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
