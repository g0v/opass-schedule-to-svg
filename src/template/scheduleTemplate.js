import { getSessionLayout, scheduleItemTemplate } from './scheduleItemTemplate.js'

export function scheduleTemplate(schedule, sessions, config) {
  const { svgWidth, svgPreserveAspectRatio, css } = config
  let currentY = 0
  const items = sessions.map(session => {
    const layout = getSessionLayout(session, schedule.speakers, config, currentY)
    currentY += layout.height
    return scheduleItemTemplate(session, schedule.speakers, config, layout)
  })

  return {
    name: 'svg',
    type: 'element',
    value: '',
    parent: null,
    attributes: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: svgWidth,
      height: currentY,
      viewBox: `0 0 ${svgWidth} ${currentY}`,
      preserveAspectRatio: svgPreserveAspectRatio,
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
            value: css,
            parent: null,
            attributes: {},
            children: [],
          },
        ],
      },
      ...items,
    ],
  }
}
