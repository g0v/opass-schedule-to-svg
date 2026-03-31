import { formatTime } from '../../utils/formatTime.js'
import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext'

export function scheduleItemTemplate(session, speakerList, config, layout) {
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const { svgWidth, sessionBlock } = config
  const titleLayout = layout.titleLayout
  const timeTextStyle = normalizeTextStyle(sessionBlock.timeText.style)
  const titleZhStyle = normalizeTextStyle(sessionBlock.titleZh.style)
  const titleEnStyle = normalizeTextStyle(sessionBlock.titleEn.style)
  const speakerStyle = normalizeTextStyle(sessionBlock.speaker.style || '')

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
          style: timeTextStyle,
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
        name: 'g',
        type: 'element',
        value: '',
        parent: null,
        attributes: {},
        children: titleLayout.zhLines.map((line, index) => ({
          name: 'text',
          type: 'element',
          value: '',
          parent: null,
          attributes: {
            x: sessionBlock.titleZh.x,
            y: getTextLineY(layout.y, layout.height, titleLayout.blockHeight, titleLayout.topY, titleLayout.zhFontSize, titleLayout.zhLineHeight, index),
            class: 'title',
            style: titleZhStyle,
          },
          children: [
            {
              name: '',
              type: 'text',
              value: line,
              parent: null,
              attributes: {},
              children: [],
            },
          ],
        })),
      },
      {
        name: 'g',
        type: 'element',
        value: '',
        parent: null,
        attributes: {},
        children: titleLayout.enLines.map((line, index) => ({
          name: 'text',
          type: 'element',
          value: '',
          parent: null,
          attributes: {
            x: sessionBlock.titleEn.x,
            y: getTextLineY(layout.y, layout.height, titleLayout.blockHeight, titleLayout.enTopY, titleLayout.enFontSize, titleLayout.enLineHeight, index),
            class: 'title',
            style: titleEnStyle,
          },
          children: [
            {
              name: '',
              type: 'text',
              value: line,
              parent: null,
              attributes: {},
              children: [],
            },
          ],
        })),
      },
      {
        name: 'g',
        type: 'element',
        value: '',
        parent: null,
        attributes: {},
        children: speakers.map((speaker, index) => ({
          name: 'text',
          type: 'element',
          value: '',
          parent: null,
          attributes: {
            x: sessionBlock.speaker.x,
            y: getSpeakerY(layout.y, layout.height, sessionBlock.speaker, speakers.length, index),
            class: 'speaker',
            style: speakerStyle,
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

function getSpeakerY(rowTop, rowHeight, speakerConfig, speakerCount, lineIndex = 0) {
  if (speakerCount === 0) {
    return rowTop + rowHeight / 2
  }

  const { blockHeight, fontSize, dy } = getSpeakerMetrics(speakerConfig, speakerCount)
  const blockTop = rowTop + (rowHeight - blockHeight) / 2
  return blockTop + fontSize + dy * lineIndex
}

export function getSessionLayout(session, speakerList, config, y) {
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const baseHeight = Number(config.rowHeight) || 0
  const speakerConfig = config.sessionBlock.speaker
  const sessionYPadding = getSessionVerticalPadding(config)
  const yPadding = Number(speakerConfig.yPadding) || 0
  const { blockHeight } = getSpeakerMetrics(speakerConfig, speakers.length)
  const speakerHeight = speakers.length > 0 ? blockHeight + yPadding * 2 : 0
  const titleLayout = getTitleLayout(session, config)

  return {
    y,
    height: Math.max(baseHeight, speakerHeight, titleLayout.blockHeight) + sessionYPadding * 2,
    titleLayout,
  }
}

function getTitleLayout(session, config) {
  const { sessionBlock } = config
  const titleMaxWidth = getTitleMaxWidth(config)
  const zhLineHeight = getLineHeight(sessionBlock.titleZh.style)
  const enLineHeight = getLineHeight(sessionBlock.titleEn.style)
  const zhFontSize = getFontSize(sessionBlock.titleZh.style, zhLineHeight)
  const enFontSize = getFontSize(sessionBlock.titleEn.style, enLineHeight)
  const zhLines = wrapTextWithPretext(session.zh.title, sessionBlock.titleZh.style, titleMaxWidth)
  const enLines = wrapTextWithPretext(session.en.title, sessionBlock.titleEn.style, titleMaxWidth)
  const titleGap = Math.max((sessionBlock.titleEn.yOffset || 0) - (sessionBlock.titleZh.yOffset || 0), 0)
  const zhBlockHeight = getTextBlockHeight(zhLines.length, zhLineHeight, zhFontSize)
  const enBlockHeight = getTextBlockHeight(enLines.length, enLineHeight, enFontSize)
  const blockHeight = zhBlockHeight + titleGap + enBlockHeight

  return {
    zhLines,
    enLines,
    zhLineHeight,
    enLineHeight,
    zhFontSize,
    enFontSize,
    topY: 0,
    enTopY: zhBlockHeight + titleGap,
    blockHeight,
  }
}

function getSpeakerMetrics(speakerConfig, speakerCount) {
  if (speakerCount === 0) {
    return { blockHeight: 0, ascent: 0 }
  }

  const fontSize = getFontSize(speakerConfig.style, Number(speakerConfig.lineHeight) || Number(speakerConfig.dy) || 24)
  const dy = Number(speakerConfig.dy) || Number(speakerConfig.lineHeight) || fontSize
  const blockHeight = fontSize + dy * (speakerCount - 1)

  return { blockHeight, fontSize, dy }
}

function getFontSize(style, fallback) {
  const match = (style || '').match(/font-size:\s*([\d.]+)px/i)
  return match ? parseFloat(match[1]) : fallback
}

function getLineHeight(style) {
  const fontSize = getFontSize(style, 16)
  const match = (style || '').match(/line-height:\s*([\d.]+)(px)?/i)

  if (!match) {
    return fontSize * 1.2
  }

  return match[2] ? parseFloat(match[1]) : fontSize * parseFloat(match[1])
}

function getTextBlockHeight(lineCount, lineHeight, fontSize) {
  if (lineCount <= 0) {
    return 0
  }

  return fontSize + lineHeight * Math.max(lineCount - 1, 0)
}

function getTextLineY(rowTop, rowHeight, blockHeight, blockOffsetY, fontSize, lineHeight, lineIndex) {
  const blockTop = rowTop + (rowHeight - blockHeight) / 2 + blockOffsetY
  return blockTop + fontSize + lineHeight * lineIndex
}

function getTitleMaxWidth(config) {
  const { sessionBlock, svgWidth } = config
  const titleLeft = Number(sessionBlock.titleZh.x) || 0
  const speakerLeft = Number(sessionBlock.speaker?.x) || Number(svgWidth) || 0
  const rightPadding = Number(sessionBlock.titleRightPadding) || 24

  return Math.max(speakerLeft - titleLeft - rightPadding, 80)
}

function getSessionVerticalPadding(config) {
  return Number(config.sessionBlock?.yPadding) || 12
}

function wrapTextWithPretext(text, style, maxWidth) {
  if (!text) {
    return ['']
  }
  const normalizedStyle = normalizeTextStyle(style)
  const lineHeight = getLineHeight(normalizedStyle)
  const prepared = prepareWithSegments(text, getCanvasFont(normalizedStyle))
  const { lines } = layoutWithLines(prepared, maxWidth, lineHeight)
  return lines.length > 0 ? lines.map(line => line.text) : ['']
}

function getCanvasFont(style) {
  const fontStyle = getStyleValue(style, 'font-style') || 'normal'
  const fontWeight = getStyleValue(style, 'font-weight') || '400'
  const fontSize = `${getFontSize(style, 16)}px`
  const fontFamily = getStyleValue(style, 'font-family') || 'sans-serif'

  return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`
}

function getStyleValue(style, property) {
  const match = (style || '').match(new RegExp(`${escapeRegExp(property)}\\s*:\\s*([^;]+)`, 'i'))
  return match ? match[1].trim() : ''
}

function normalizeTextStyle(style) {
  const fontFamily = getStyleValue(style, 'font-family')

  if (!fontFamily) {
    return style || ''
  }

  return replaceStyleValue(style, 'font-family', normalizeFontFamily(fontFamily))
}

function normalizeFontFamily(fontFamily) {
  if (/Onest-Regular_|'Onest'|\bOnest\b/i.test(fontFamily)) {
    return "'Liberation Sans', Arial, sans-serif"
  }

  if (/NotoSansTC-Regular|'Noto Sans TC'|\bNoto Sans TC\b/i.test(fontFamily)) {
    return "'Noto Sans CJK TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
  }

  return fontFamily
}

function replaceStyleValue(style, property, nextValue) {
  if (!style) {
    return `${property}:${nextValue}`
  }

  const pattern = new RegExp(`(${escapeRegExp(property)}\\s*:\\s*)([^;]+)`, 'i')
  if (pattern.test(style)) {
    return style.replace(pattern, `$1${nextValue}`)
  }

  const separator = style.trim().endsWith(';') || style.trim() === '' ? '' : ';'
  return `${style}${separator}${property}:${nextValue}`
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
