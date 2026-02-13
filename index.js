import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { stringify } from 'svgson'
import { formatDate } from './utils/formatDate.js'
import generateSchedule from './lib/schedule-json-generator/generateSchedule.js'
import { scheduleTemplate } from './src/template/scheduleTemplate.js'

const outputDir = path.resolve('./dist')
const outputDataDir = path.resolve(outputDir, 'data')

let scheduleJsonStr

if (process.env.GCP_API_KEY && process.env.SPREADSHEET_KEY) {
  scheduleJsonStr = await generateSchedule({
    spreadsheetKey: process.env.SPREADSHEET_KEY,
    gcp_api_key: process.env.GCP_API_KEY,
    default_avatar: process.env.DEFAULT_AVATAR,
    avatar_base_url: process.env.AVATAR_BASE_URL,
  })
} else {
  console.warn('⚠️  Missing GCP_API_KEY or SPREADSHEET_KEY. Fetching production data for local testing...')
  const res = await fetch('https://g0v.github.io/opass-schedule-to-svg/schedule.json')
  scheduleJsonStr = await res.text()
}

const schedule = JSON.parse(scheduleJsonStr)
const [dates, rooms] = getDatesAndRooms(schedule)
const sessionGroups = getSessionGroups(schedule)
const svgs = await getSvgs(schedule, sessionGroups)

await fs.rm(outputDir, { recursive: true, force: true })
await fs.mkdir(outputDataDir, { recursive: true })
const tasks = []
tasks.push(fs.writeFile(path.resolve(outputDataDir, 'schedule.json'), scheduleJsonStr))
tasks.push(fs.writeFile(path.resolve(outputDataDir, 'dates.json'), JSON.stringify(dates)))
tasks.push(fs.writeFile(path.resolve(outputDataDir, 'rooms.json'), JSON.stringify(rooms)))
svgs.forEach(svg => {
  tasks.push(fs.writeFile(path.resolve(outputDataDir, svg.name), svg.content))
})
tasks.push(fs.copyFile(path.resolve('./style.config.json'), path.resolve(outputDataDir, 'style.config.json')))

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

function getSessionGroups(schedule) {
  const groups = {}
  schedule.sessions.forEach(session => {
    const date = formatDate(session.start)
    const room = session.room
    const name = `${date}-${room}`

    if (!groups[name]) {
      groups[name] = []
    }

    groups[name].push(session)
  })
  return groups
}

async function getSvgs(schedule, sessionGroups) {
  const styleConfig = JSON.parse(await fs.readFile(new URL('./style.config.json', import.meta.url)))
  const svgs = []
  for (const groupName in sessionGroups) {
    sessionGroups[groupName].sort((a, b) => new Date(a.start) - new Date(b.start))
    const svgJson = scheduleTemplate(schedule, sessionGroups[groupName], styleConfig)
    svgs.push({
      name: `${groupName}.svg`,
      content: stringify(svgJson),
    })
  }
  return svgs
}
