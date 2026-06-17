import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { scheduleToJson } from 'opass-schedule-to-json'
import { createCanvas } from '@napi-rs/canvas'
import { formatDate } from './utils/formatDate.js'

if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = class OffscreenCanvas {
    constructor(width, height) {
      this.canvas = createCanvas(width, height)
    }

    getContext(type) {
      return this.canvas.getContext(type)
    }
  }
}

const outputDir = path.resolve('./dist')
const outputDataDir = path.resolve(outputDir, 'data')

let schedule

if (process.env.SPREADSHEET_ID) {
  schedule = await scheduleToJson({
    spreadsheetId: process.env.SPREADSHEET_ID,
    defaultAvatar: process.env.DEFAULT_AVATAR,
    avatarBaseUrl: process.env.AVATAR_BASE_URL,
  })
} else {
  console.warn('⚠️  Missing SPREADSHEET_ID. Fetching production data for local testing...')
  try {
    const res = await fetch('https://g0v.github.io/opass-schedule-to-svg/schedule.json')
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    schedule = JSON.parse(await res.text())
  } catch (e) {
    console.error('⚠️  Failed to fetch fallback data. Using empty schedule.', e.message)
    schedule = { sessions: [], speakers: [] }
  }
}

const [dates, rooms] = getDatesAndRooms(schedule)

await fs.rm(outputDataDir, { recursive: true, force: true })
await fs.mkdir(outputDataDir, { recursive: true })
const tasks = []
tasks.push(fs.writeFile(path.resolve(outputDataDir, 'schedule.json'), JSON.stringify(schedule)))
tasks.push(fs.writeFile(path.resolve(outputDataDir, 'dates.json'), JSON.stringify(dates)))
tasks.push(fs.writeFile(path.resolve(outputDataDir, 'rooms.json'), JSON.stringify(rooms)))

await Promise.all(tasks)

console.log('Done!')

function getDatesAndRooms(schedule) {
  const dates = new Set()
  const rooms = new Set()

  schedule.sessions.forEach(session => {
    dates.add(formatDate(session.start))
    rooms.add(session.room)
  })

  return [Array.from(dates), Array.from(rooms)]
}
