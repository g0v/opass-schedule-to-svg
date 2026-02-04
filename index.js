import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { stringify } from 'svgson'
import generateSchedule from './lib/schedule-json-generator/generateSchedule.js'
import { scheduleTemplate } from './template/scheduleTemplate.js'

const outputDir = path.resolve('./dist')

const scheduleStr = await generateSchedule({
  spreadsheetKey: process.env.SPREADSHEET_KEY,
  gcp_api_key: process.env.GCP_API_KEY,
  default_avatar: process.env.DEFAULT_AVATAR,
  avatar_base_url: process.env.AVATAR_BASE_URL
})

const schedule = JSON.parse(scheduleStr)

await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(path.resolve(outputDir, 'schedule.json'), scheduleStr)

const sessions = schedule.sessions.slice(0, 3)
const svgJson = scheduleTemplate(schedule, sessions)
const svg = stringify(svgJson)

await fs.writeFile(path.resolve(outputDir, 'schedule.svg'), svg)
