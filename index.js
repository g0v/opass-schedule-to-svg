import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { stringify } from 'svgson'
import { dateToString } from './utils/dateToString.js'
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
const dates = new Set()
const rooms = new Set()

schedule.sessions.forEach(session => {
  const startDate = new Date(session.start)
  dates.add(dateToString(startDate))
  rooms.add(session.room)
})

const sessionGroup = {}
schedule.sessions.forEach(session => {
  const date = dateToString(new Date(session.start))
  const room = session.room
  const groupName = `${date}-${room}`

  if (!Object.hasOwn(sessionGroup, groupName)) {
    sessionGroup[groupName] = []
  }

  sessionGroup[groupName].push(session)
})

const svgs = []
for (const groupName in sessionGroup) {
  sessionGroup[groupName].sort((a, b) => new Date(a.start) - new Date(b.start))
  const svgJson = scheduleTemplate(schedule, sessionGroup[groupName])
  svgs.push({
    name: `${groupName}.svg`,
    content: stringify(svgJson)
  })
}

await fs.mkdir(outputDir, { recursive: true })
const tasks = []
tasks.push(fs.writeFile(path.resolve(outputDir, 'schedule.json'), scheduleStr))
tasks.push(fs.writeFile(path.resolve(outputDir, 'dates.json'), JSON.stringify(Array.from(dates))))
tasks.push(fs.writeFile(path.resolve(outputDir, 'rooms.json'), JSON.stringify(Array.from(rooms))))
svgs.forEach(svg => {
  tasks.push(fs.writeFile(path.resolve(outputDir, svg.name), svg.content))
})
await Promise.all(tasks)
console.log('Done!')
