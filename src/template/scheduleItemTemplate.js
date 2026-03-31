import { formatTime } from '../../utils/formatTime.js'

export function scheduleItemTemplate(session, speakerList, config, layout) {
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const { svgWidth, sessionBlock } = config

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
          y: layout.y,
          width: svgWidth,
          height: layout.height,
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
                y: layout.y + (layout.height - sessionBlock.timeBadge.height) / 2,
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
                ? layout.y + (layout.height - parseFloat(sessionBlock.timeBadge.height)) / 2 + parseFloat(sessionBlock.timeBadge.height) / 2
                : layout.y + layout.height / 2

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
          y: layout.y + (sessionBlock.titleZh.yOffset || 0),
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
          y: layout.y + (sessionBlock.titleEn.yOffset || 0),
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
          y: getSpeakerY(layout.y, layout.height, sessionBlock.speaker, speakers.length),
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

function getSpeakerY(rowTop, rowHeight, speakerConfig, speakerCount) {
  if (speakerCount === 0) {
    return rowTop + rowHeight / 2
  }

  const { blockHeight, ascent } = getSpeakerMetrics(speakerConfig, speakerCount)
  return rowTop + (rowHeight - blockHeight) / 2 + ascent
}

export function getSessionLayout(session, speakerList, config, y) {
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const baseHeight = Number(config.rowHeight) || 0
  const speakerConfig = config.sessionBlock.speaker
  const yPadding = Number(speakerConfig.yPadding) || 0
  const { blockHeight } = getSpeakerMetrics(speakerConfig, speakers.length)
  const speakerHeight = speakers.length > 0 ? blockHeight + yPadding * 2 : 0

  return {
    y,
    height: Math.max(baseHeight, speakerHeight),
  }
}

function getSpeakerMetrics(speakerConfig, speakerCount) {
  if (speakerCount === 0) {
    return { blockHeight: 0, ascent: 0 }
  }

  const fontSize = getFontSize(speakerConfig.style, Number(speakerConfig.lineHeight) || Number(speakerConfig.dy) || 24)
  const dy = Number(speakerConfig.dy) || Number(speakerConfig.lineHeight) || fontSize
  const ascent = fontSize * 0.8
  const blockHeight = fontSize + dy * (speakerCount - 1)

  return { blockHeight, ascent }
}

function getFontSize(style, fallback) {
  const match = (style || '').match(/font-size:\s*([\d.]+)px/i)
  return match ? parseFloat(match[1]) : fallback
}
