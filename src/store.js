import { reactive } from 'vue'
import fallbackConfig from '../style.config.json'

export const globalStore = reactive({
  dynamicSchedule: null,
  dynamicStyleConfig: null,
  playgroundDraftStyle: null,
  playgroundWorkingConfig: null,
  playgroundBaseConfig: null, // The user's explicitly uploaded/fetched style (reset target)
  loadedScheduleName: '預設資料',
  loadedStyleName: '預設樣式',
  inputJsonUrl: '',
  inputStyleUrl: '',
  showUploadUI: false,
  dates: [],
  rooms: [],
  selectedDate: '',
  selectedRoom: '',
})
