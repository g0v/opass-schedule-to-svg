import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { stringify } from 'svgson'
import { formatDate } from './utils/formatDate.js'
import generateSchedule from './lib/schedule-json-generator/generateSchedule.js'
import { scheduleTemplate } from './template/scheduleTemplate.js'
const styleConfig = JSON.parse(await fs.readFile(new URL('./style.config.json', import.meta.url)))

const outputDir = path.resolve('./dist')

let scheduleJsonStr

if (process.env.GCP_API_KEY && process.env.SPREADSHEET_KEY) {
  scheduleJsonStr = await generateSchedule({
    spreadsheetKey: process.env.SPREADSHEET_KEY,
    gcp_api_key: process.env.GCP_API_KEY,
    default_avatar: process.env.DEFAULT_AVATAR,
    avatar_base_url: process.env.AVATAR_BASE_URL
  })
} else {
  console.log('⚠️  Missing GCP_API_KEY or SPREADSHEET_KEY. Fetching production data for local testing...')
  const res = await fetch('https://g0v.github.io/opass-schedule-to-svg/schedule.json')
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`)
  scheduleJsonStr = await res.text()
}
const schedule = JSON.parse(scheduleJsonStr)
const [dates, rooms] = getDatesAndRooms(schedule)
const sessionGroups = getSessionGroups(schedule)
const svgs = getSvgs(schedule, sessionGroups)

await fs.mkdir(outputDir, { recursive: true })
const tasks = []
tasks.push(fs.writeFile(path.resolve(outputDir, 'schedule.json'), scheduleJsonStr))
tasks.push(fs.writeFile(path.resolve(outputDir, 'dates.json'), JSON.stringify(dates)))
tasks.push(fs.writeFile(path.resolve(outputDir, 'rooms.json'), JSON.stringify(rooms)))
svgs.forEach(svg => {
  tasks.push(fs.writeFile(path.resolve(outputDir, svg.name), svg.content))
})
tasks.push(fs.copyFile(path.resolve('./index.html'), path.resolve(outputDir, 'index.html')))
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

    if (!Object.hasOwn(groups, name)) {
      groups[name] = []
    }

    groups[name].push(session)
  })
  return groups
}

function getSvgs(schedule, sessionGroups) {
  const svgs = []
  for (const groupName in sessionGroups) {
    sessionGroups[groupName].sort((a, b) => new Date(a.start) - new Date(b.start))
    const svgJson = scheduleTemplate(schedule, sessionGroups[groupName], styleConfig)
    svgs.push({
      name: `${groupName}.svg`,
      content: stringify(svgJson)
    })
  }
  return svgs
}
