<script setup>
import { ref, onMounted, watch } from 'vue'
import { stringify } from 'svgson'
import { scheduleTemplate } from '~/template/scheduleTemplate.js'
import StyleInput from '~/components/StyleInput.vue'

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
  { deep: true },
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
  <div style="display: flex; width: 100%; height: 100%">
    <div class="sidebar">
      <div class="header">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
          <h2 style="margin: 0">SVG Playground</h2>
          <a href="./index.html" style="text-decoration: none">
            <button class="btn" style="width: auto; aspect-ratio: auto; padding: 4px 12px; font-size: 13px">回首頁</button>
          </a>
        </div>
        <div class="actions">
          <!-- Download Config (Style) -->
          <button class="btn btn-primary" @click="downloadConfig" title="導出樣式設定檔 (JSON)">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9Z"
              />
            </svg>
          </button>
          <!-- Download SVG (Image) -->
          <button class="btn btn-success" @click="downloadSVG" title="導出圖檔 (SVG)">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </button>
          <!-- Import Config -->
          <label class="btn btn-warning" for="config-import" title="匯入樣式設定檔">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            <input id="config-import" type="file" @change="importConfig" accept=".json" style="display: none" />
          </label>
          <!-- Reset All -->
          <button class="btn btn-danger" @click="resetConfig" title="全部重置">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Global Layout -->
      <div class="control-group" v-if="config">
        <h3>
          版面設定 (Global Layout)
          <button class="reset-btn" @click="resetKeys(['rowHeight', 'svgWidth'])" title="重置此區塊">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </h3>
        <div class="input-row">
          <label>行高</label>
          <div class="input-controls">
            <input type="range" min="50" max="300" v-model.number="config.rowHeight" />
            <input type="number" v-model.number="config.rowHeight" />
          </div>
        </div>
        <div class="input-row">
          <label>SVG 寬度</label>
          <div class="input-controls">
            <input type="range" min="300" max="2000" v-model.number="config.svgWidth" />
            <input type="number" v-model.number="config.svgWidth" />
          </div>
        </div>
      </div>

      <!-- Session Block Layout -->
      <div class="control-group" v-if="config">
        <h3>
          議程區塊樣式 (Session Block)
          <button class="reset-btn" @click="resetKeys(['sessionBlock.background'])" title="重置此區塊">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </h3>
        <div class="input-row">
          <label>背景顏色</label>
          <div class="input-controls">
            <input type="color" v-model="config.sessionBlock.background.fill" />
            <input type="text" v-model="config.sessionBlock.background.fill" />
          </div>
        </div>
        <div class="input-row">
          <label>邊框顏色</label>
          <div class="input-controls">
            <input type="color" v-model="config.sessionBlock.background.stroke" />
            <input type="text" v-model="config.sessionBlock.background.stroke" />
          </div>
        </div>
      </div>

      <!-- Time Badge Section -->
      <div class="control-group" v-if="config">
        <h3>
          時間標籤區塊 (Time Badge)
          <button class="reset-btn" @click="resetKeys(['sessionBlock.timeBadge', 'sessionBlock.timeText'])" title="重置此區塊">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </h3>

        <h4>
          標籤樣式 (Badge)
          <label class="toggle-switch">
            <input type="checkbox" v-model="config.sessionBlock.timeBadge.show" />
            <span class="slider"></span>
          </label>
        </h4>

        <div v-if="config.sessionBlock.timeBadge.show !== false">
          <div class="input-row">
            <label>背景顏色</label>
            <div class="input-controls">
              <input type="color" v-model="config.sessionBlock.timeBadge.fill" />
              <input type="text" v-model="config.sessionBlock.timeBadge.fill" />
            </div>
          </div>
          <div class="input-row">
            <label>X 座標</label>
            <div class="input-controls">
              <input type="range" min="0" max="500" step="0.1" v-model.number="config.sessionBlock.timeBadge.x" />
              <input type="number" step="0.1" v-model.number="config.sessionBlock.timeBadge.x" />
            </div>
          </div>
          <div class="input-row">
            <label>寬度</label>
            <div class="input-controls">
              <input type="range" min="10" max="300" step="0.1" v-model.number="config.sessionBlock.timeBadge.width" />
              <input type="number" step="0.1" v-model.number="config.sessionBlock.timeBadge.width" />
            </div>
          </div>
          <div class="input-row">
            <label>高度</label>
            <div class="input-controls">
              <input type="range" min="10" max="100" step="0.1" v-model.number="config.sessionBlock.timeBadge.height" />
              <input type="number" step="0.1" v-model.number="config.sessionBlock.timeBadge.height" />
            </div>
          </div>
          <div class="input-row">
            <label>圓角 RX</label>
            <div class="input-controls">
              <input type="range" min="0" max="50" v-model.number="config.sessionBlock.timeBadge.rx" />
              <input type="number" v-model.number="config.sessionBlock.timeBadge.rx" />
            </div>
          </div>
          <div class="input-row">
            <label>圓角 RY</label>
            <div class="input-controls">
              <input type="range" min="0" max="50" v-model.number="config.sessionBlock.timeBadge.ry" />
              <input type="number" v-model.number="config.sessionBlock.timeBadge.ry" />
            </div>
          </div>
        </div>

        <h4>時間文字 (Text)</h4>
        <StyleInput :obj="config.sessionBlock.timeText" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
        <StyleInput :obj="config.sessionBlock.timeText" prop="fill" type="color" label="文字顏色" />
        <StyleInput :obj="config.sessionBlock.timeText" prop="font-family" type="select" :options="fontOptions" label="字型" />
        <StyleInput :obj="config.sessionBlock.timeText" prop="font-weight" type="select" :options="weightOptions" label="字重" />
        <div class="input-row">
          <label>X 座標</label>
          <div class="input-controls">
            <input type="range" min="0" max="500" step="0.1" v-model.number="config.sessionBlock.timeText.x" />
            <input type="number" step="0.1" v-model.number="config.sessionBlock.timeText.x" />
          </div>
        </div>
        <div class="input-row">
          <label>Y 位移</label>
          <div class="input-controls">
            <input type="range" min="0" max="100" step="1" v-model.number="config.sessionBlock.timeText.yOffset" />
            <input type="number" step="1" v-model.number="config.sessionBlock.timeText.yOffset" />
          </div>
        </div>
      </div>

      <!-- Session Title Section -->
      <div class="control-group" v-if="config">
        <h3>
          議程名字區塊 (Titles)
          <button class="reset-btn" @click="resetKeys(['sessionBlock.titleZh', 'sessionBlock.titleEn'])" title="重置此區塊">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </h3>

        <h4>中文標題 (Zh)</h4>
        <StyleInput :obj="config.sessionBlock.titleZh" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
        <StyleInput :obj="config.sessionBlock.titleZh" prop="fill" type="color" label="文字顏色" />
        <StyleInput :obj="config.sessionBlock.titleZh" prop="font-family" type="select" :options="fontOptions" label="字型" />
        <StyleInput :obj="config.sessionBlock.titleZh" prop="font-weight" type="select" :options="weightOptions" label="字重" />
        <div class="input-row">
          <label>X 座標</label>
          <div class="input-controls">
            <input type="range" min="0" max="800" step="1" v-model.number="config.sessionBlock.titleZh.x" />
            <input type="number" step="1" v-model.number="config.sessionBlock.titleZh.x" />
          </div>
        </div>
        <div class="input-row">
          <label>Y 位移</label>
          <div class="input-controls">
            <input type="range" min="0" max="150" step="1" v-model.number="config.sessionBlock.titleZh.yOffset" />
            <input type="number" step="1" v-model.number="config.sessionBlock.titleZh.yOffset" />
          </div>
        </div>

        <h4>英文標題 (En)</h4>
        <StyleInput :obj="config.sessionBlock.titleEn" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
        <StyleInput :obj="config.sessionBlock.titleEn" prop="fill" type="color" label="文字顏色" />
        <StyleInput :obj="config.sessionBlock.titleEn" prop="font-family" type="select" :options="fontOptions" label="字型" />
        <StyleInput :obj="config.sessionBlock.titleEn" prop="font-weight" type="select" :options="weightOptions" label="字重" />
        <div class="input-row">
          <label>X 座標</label>
          <div class="input-controls">
            <input type="range" min="0" max="800" step="1" v-model.number="config.sessionBlock.titleEn.x" />
            <input type="number" step="1" v-model.number="config.sessionBlock.titleEn.x" />
          </div>
        </div>
        <div class="input-row">
          <label>Y 位移</label>
          <div class="input-controls">
            <input type="range" min="0" max="150" step="1" v-model.number="config.sessionBlock.titleEn.yOffset" />
            <input type="number" step="1" v-model.number="config.sessionBlock.titleEn.yOffset" />
          </div>
        </div>
      </div>

      <!-- Speaker Section -->
      <div class="control-group" v-if="config">
        <h3>
          講者區塊 (Speakers)
          <button class="reset-btn" @click="resetKeys(['sessionBlock.speaker'])" title="重置此區塊">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </h3>
        <StyleInput :obj="config.sessionBlock.speaker" prop="font-size" unit="px" type="range" min="10" max="60" label="字體大小" />
        <StyleInput :obj="config.sessionBlock.speaker" prop="fill" type="color" label="文字顏色" />
        <StyleInput :obj="config.sessionBlock.speaker" prop="font-family" type="select" :options="fontOptions" label="字型" />
        <StyleInput :obj="config.sessionBlock.speaker" prop="font-weight" type="select" :options="weightOptions" label="字重" />
        <div class="input-row">
          <label>X 座標</label>
          <div class="input-controls">
            <input type="range" min="0" max="1000" step="1" v-model.number="config.sessionBlock.speaker.x" />
            <input type="number" step="1" v-model.number="config.sessionBlock.speaker.x" />
          </div>
        </div>
        <div class="input-row">
          <label>行高</label>
          <div class="input-controls">
            <input type="range" min="10" max="60" step="1" v-model.number="config.sessionBlock.speaker.lineHeight" />
            <input type="number" step="1" v-model.number="config.sessionBlock.speaker.lineHeight" />
          </div>
        </div>
        <div class="input-row">
          <label>DY</label>
          <div class="input-controls">
            <input type="range" min="10" max="60" step="1" v-model.number="config.sessionBlock.speaker.dy" />
            <input type="number" step="1" v-model.number="config.sessionBlock.speaker.dy" />
          </div>
        </div>
        <div class="input-row">
          <label>Y Padding</label>
          <div class="input-controls">
            <input type="range" min="0" max="50" step="1" v-model.number="config.sessionBlock.speaker.yPadding" />
            <input type="number" step="1" v-model.number="config.sessionBlock.speaker.yPadding" />
          </div>
        </div>
      </div>

      <div class="control-group" v-if="config">
        <h3>
          CSS 樣式
          <button class="reset-btn" @click="resetKeys(['css'])" title="重置此區塊">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </h3>
        <textarea class="css-editor" v-model="config.css"></textarea>
      </div>
    </div>

    <div class="main-content">
      <div class="preview-container" v-html="svgHtml"></div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #8da4be;
  --border-color: #e5e7eb;
  --bg-sidebar: #ffffff;
  --bg-main: #f3f4f6;
  --text-color: #374151;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  display: flex;
  height: 100vh;
  overflow: hidden;
  color: var(--text-color);
}

.sidebar {
  width: 400px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.header h2 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: var(--bg-main);
  overflow: auto;
  padding: 24px;
  position: relative;
}

.preview-container {
  background: white;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-width: 100%;
  padding: 1px;
  /* Preventing margin collapse */
}

.control-group {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: box-shadow 0.2s;
}

.control-group h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reset-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.reset-btn:hover {
  color: #ef4444;
  background: #fef2f2;
}

.reset-btn svg {
  width: 16px;
  height: 16px;
}

.control-group h4 {
  margin: 20px 0 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.input-row label:not(.toggle-switch) {
  font-size: 0.875rem;
  color: #4b5563;
  flex-shrink: 0;
  width: 70px;
}

.input-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0;
  justify-content: flex-end;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin-left: auto;
  /* Align to right if needed */
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  background: #e5e7eb;
  height: 6px;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

/* Chrome/Safari 拉桿圓頭 */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition:
    transform 0.1s,
    background 0.2s;
}

input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

/* Firefox 拉桿圓頭 */
input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

input[type='number'],
input[type='text'] {
  width: 70px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  text-align: right;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

input[type='number']:focus,
input[type='text']:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input[type='color'] {
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
}

input[type='color']::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type='color']::-webkit-color-swatch {
  border: none;
}

textarea.css-editor {
  width: 100%;
  height: 120px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  resize: vertical;
  background-color: #f9fafb;
  color: #374151;
  line-height: 1.4;
}

.actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 4px 0;
  margin-top: 10px;
}

.btn {
  aspect-ratio: 1;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #6b7280;
}

.btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.btn:active {
  transform: scale(0.9);
}

/* Hover 時強化顏色並填滿底色 */
.btn-primary:hover {
  background: #8da4be;
  color: white;
  border-color: #8da4be;
}

.btn-success:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-warning:hover {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-danger:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>
