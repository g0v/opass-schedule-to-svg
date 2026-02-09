import { formatTime } from '../utils/formatTime.js'

export function scheduleItemTemplate(i, session, speakerList, config) {
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const { rowHeight, svgWidth, sessionBlock } = config

  return {
    name: 'g',
    type: 'element',
    value: '',
    parent: null,
    attributes: {
      width: svgWidth,
      height: 'sessionHeight'
    },
    children: [
      {
        name: 'rect',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          y: rowHeight * i,
          width: svgWidth,
          height: rowHeight,
          stroke: sessionBlock.background.stroke,
          fill: sessionBlock.background.fill
        },
        children: []
      },
      {
        name: 'rect',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.timeBadge.x,
          y: rowHeight * i,
          width: sessionBlock.timeBadge.width,
          height: sessionBlock.timeBadge.height,
          rx: sessionBlock.timeBadge.rx,
          ry: sessionBlock.timeBadge.ry,
          fill: sessionBlock.timeBadge.fill
        },
        children: []
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.timeText.x,
          y: rowHeight * i + sessionBlock.timeText.yOffset,
          class: 'time',
          'text-anchor': 'middle',
          style: sessionBlock.timeText.style
        },
        children: [
          {
            name: '',
            type: 'text',
            value: formatTime(session.start),
            parent: null,
            attributes: {},
            children: []
          }
        ]
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.titleZh.x,
          y: rowHeight * i + sessionBlock.titleZh.yOffset,
          class: 'title',
          style: sessionBlock.titleZh.style
        },
        children: [
          {
            name: '',
            type: 'text',
            value: session.zh.title,
            parent: null,
            attributes: {},
            children: []
          }
        ]
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.titleEn.x,
          y: rowHeight * i + sessionBlock.titleEn.yOffset,
          class: 'title',
          style: sessionBlock.titleEn.style
        },
        children: [
          {
            name: '',
            type: 'text',
            value: session.en.title,
            parent: null,
            attributes: {},
            children: []
          }
        ]
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.speaker.x,
          y: Math.max(
            sessionBlock.speaker.yPadding,
            rowHeight * i + (rowHeight - sessionBlock.speaker.lineHeight * speakers.length) / 2
          ),
          class: 'speaker'
        },
        children: speakers.map(speaker => ({
          name: 'tspan',
          type: 'element',
          value: '',
          parent: null,
          attributes: {
            x: sessionBlock.speaker.x,
            dy: sessionBlock.speaker.dy
          },
          children: [
            {
              name: '',
              type: 'text',
              value: speaker.zh.name,
              parent: null,
              attributes: {},
              children: []
            }
          ]
        }))
      }
    ]
  }
}
