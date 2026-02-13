import { scheduleItemTemplate } from './scheduleItemTemplate.js'

export function scheduleTemplate(schedule, sessions, config) {
  const { rowHeight, svgWidth, svgPreserveAspectRatio, css } = config
  const items = sessions.map((session, i) => scheduleItemTemplate(i, session, schedule.speakers, config))

  return {
    name: 'svg',
    type: 'element',
    value: '',
    parent: null,
    attributes: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: svgWidth,
      height: rowHeight * items.length,
      viewBox: `0 0 ${svgWidth} ${rowHeight * items.length}`,
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
