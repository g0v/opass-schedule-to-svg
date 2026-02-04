import { scheduleItemTemplate } from './scheduleItemTemplate.js'

export function scheduleTemplate(schedule, sessions) {
  const items = sessions.map((session, i) => scheduleItemTemplate(i, session, schedule.speakers))

  return {
    name: 'svg',
    type: 'element',
    value: '',
    parent: null,
    attributes: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '1080',
      height: '789.28',
      viewBox: '0 0 1080 789.28',
      preserveAspectRatio: 'xMidYMid meet'
    },
    children: [
      {
        name: 'style',
        type: 'element',
        value: '',
        parent: null,
        attributes: {},
        children: [
          {
            name: '',
            type: 'text',
            value:
              '\n            text { font-family: Arial, sans-serif; }\n            .time { fill: #ffffff; }\n            .title { fill: #000000; }\n            .speaker { fill: #000000; }\n          ',
            parent: null,
            attributes: {},
            children: []
          }
        ]
      },
      ...items
    ]
  }
}
