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
      height: 'sessionHeight',
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
          fill: sessionBlock.background.fill,
        },
        children: [],
      },
      ...(sessionBlock.timeBadge.show !== false
        ? [
            {
              name: 'rect',
              type: 'element',
              value: '',
              parent: null,
              attributes: {
                x: sessionBlock.timeBadge.x,
                y: rowHeight * i + (rowHeight - sessionBlock.timeBadge.height) / 2,
                width: sessionBlock.timeBadge.width,
                height: sessionBlock.timeBadge.height,
                rx: sessionBlock.timeBadge.rx,
                ry: sessionBlock.timeBadge.ry,
                fill: sessionBlock.timeBadge.fill,
              },
              children: [],
            },
          ]
        : []),
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.timeBadge.show !== false ? parseFloat(sessionBlock.timeBadge.x) + parseFloat(sessionBlock.timeBadge.width) / 2 : sessionBlock.timeText.x,
          y: (() => {
            const centerY =
              sessionBlock.timeBadge.show !== false
                ? rowHeight * i + (rowHeight - parseFloat(sessionBlock.timeBadge.height)) / 2 + parseFloat(sessionBlock.timeBadge.height) / 2
                : rowHeight * i + rowHeight / 2

            // Try to extract font-size to calculate baseline offset (approx 0.35-0.4em)
            const fontSizeMatch = sessionBlock.timeText.style.match(/font-size:([\d.]+)px/)
            const fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 24
            const baselineOffset = fontSize * 0.35

            return centerY + baselineOffset + (sessionBlock.timeText.yOffset || 0)
          })(),
          class: 'time',
          'text-anchor': 'middle',
          style: sessionBlock.timeText.style,
        },
        children: [
          {
            name: '',
            type: 'text',
            value: formatTime(session.start),
            parent: null,
            attributes: {},
            children: [],
          },
        ],
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.titleZh.x,
          y: rowHeight * i + (sessionBlock.titleZh.yOffset || 0),
          class: 'title',
          style: sessionBlock.titleZh.style,
        },
        children: [
          {
            name: '',
            type: 'text',
            value: session.zh.title,
            parent: null,
            attributes: {},
            children: [],
          },
        ],
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.titleEn.x,
          y: rowHeight * i + (sessionBlock.titleEn.yOffset || 0),
          class: 'title',
          style: sessionBlock.titleEn.style,
        },
        children: [
          {
            name: '',
            type: 'text',
            value: session.en.title,
            parent: null,
            attributes: {},
            children: [],
          },
        ],
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: sessionBlock.speaker.x,
          y: Math.max(sessionBlock.speaker.yPadding, rowHeight * i + (rowHeight - sessionBlock.speaker.lineHeight * speakers.length) / 2),
          class: 'speaker',
          style: sessionBlock.speaker.style || '',
        },
        children: speakers.map(speaker => ({
          name: 'tspan',
          type: 'element',
          value: '',
          parent: null,
          attributes: {
            x: sessionBlock.speaker.x,
            dy: sessionBlock.speaker.dy,
          },
          children: [
            {
              name: '',
              type: 'text',
              value: speaker.zh.name,
              parent: null,
              attributes: {},
              children: [],
            },
          ],
        })),
      },
    ],
  }
}
