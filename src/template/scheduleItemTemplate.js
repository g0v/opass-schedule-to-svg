import { formatTime } from '../../utils/formatTime.js'
import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext'

export function scheduleItemTemplate(session, schedule, config, layout) {
  const speakerList = schedule.speakers
  const sessionTypes = schedule.session_types || []
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const sessionTypeData = sessionTypes.find(t => t.id === session.type)
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
      ...(sessionBlock.background.show !== false
        ? [
            {
              name: 'rect',
              type: 'element',
              value: '',
              parent: null,
              attributes: {
                y: layout.y,
                width: svgWidth,
                height: layout.height,
                stroke:
                  sessionBlock.background.hasStroke !== false && sessionBlock.background.borderSides && sessionBlock.background.borderSides.length === 4
                    ? sessionBlock.background.stroke
                    : 'none',
                fill: sessionBlock.background.hasFill !== false ? sessionBlock.background.fill : 'none',
              },
              children: [],
            },
          ]
        : []),
      ...(sessionBlock.background.show !== false && sessionBlock.background.borderSides && sessionBlock.background.borderSides.length < 4
        ? sessionBlock.background.borderSides.map(side => {
            const attributes = {
              stroke: sessionBlock.background.hasStroke !== false ? sessionBlock.background.stroke : 'none',
              'stroke-width': 1, // Default stroke width
            }
            if (side === 'top') {
              attributes.x1 = 0
              attributes.y1 = layout.y
              attributes.x2 = svgWidth
              attributes.y2 = layout.y
            } else if (side === 'bottom') {
              attributes.x1 = 0
              attributes.y1 = layout.y + layout.height
              attributes.x2 = svgWidth
              attributes.y2 = layout.y + layout.height
            } else if (side === 'left') {
              attributes.x1 = 0
              attributes.y1 = layout.y
              attributes.x2 = 0
              attributes.y2 = layout.y + layout.height
            } else if (side === 'right') {
              attributes.x1 = svgWidth
              attributes.y1 = layout.y
              attributes.x2 = svgWidth
              attributes.y2 = layout.y + layout.height
            }
            return {
              name: 'line',
              type: 'element',
              value: '',
              parent: null,
              attributes,
              children: [],
            }
          })
        : []),
      ...(sessionBlock.timeBadge.show !== false && sessionBlock.timeBlock?.show !== false
        ? [
            (() => {
              const x = parseFloat(sessionBlock.timeBadge.x)
              const y = layout.y + (layout.height - parseFloat(sessionBlock.timeBadge.height)) / 2 + (sessionBlock.timeBadge.yOffset || 0)
              const w = parseFloat(sessionBlock.timeBadge.width)
              const h = parseFloat(sessionBlock.timeBadge.height)
              const rx = parseFloat(sessionBlock.timeBadge.rx) || 0
              const ry = parseFloat(sessionBlock.timeBadge.ry) || rx
              const corners = sessionBlock.timeBadge.roundedCorners || ['tl', 'tr', 'br', 'bl']

              return {
                name: 'path',
                type: 'element',
                value: '',
                parent: null,
                attributes: {
                  d: generateRoundedRectPath(
                    parseFloat(sessionBlock.timeBadge.x), 
                    layout.y + (layout.height - parseFloat(sessionBlock.timeBadge.height)) / 2 + (sessionBlock.timeBlock?.yOffset ?? 0), 
                    parseFloat(sessionBlock.timeBadge.width), 
                    parseFloat(sessionBlock.timeBadge.height), 
                    parseFloat(sessionBlock.timeBadge.rx), 
                    parseFloat(sessionBlock.timeBadge.ry), 
                    sessionBlock.timeBadge.roundedCorners || ['tl', 'tr', 'br', 'bl']
                  ),
                  fill: sessionBlock.timeBadge.hasFill !== false ? sessionBlock.timeBadge.fill : 'none',
                },
                children: [],
              }
            })(),
          ]
        : []),
      ...(sessionBlock.timeText.show !== false && sessionBlock.timeBlock?.show !== false
        ? [
            {
              name: 'text',
              type: 'element',
              value: '',
              parent: null,
              attributes: {
                x: sessionBlock.timeBadge.show !== false ? parseFloat(sessionBlock.timeBadge.x) + parseFloat(sessionBlock.timeBadge.width) / 2 : sessionBlock.timeText.x,
                y: (() => {
                  const blockYOffset = sessionBlock.timeBlock?.yOffset ?? 0
                  const centerY = layout.y + (layout.height / 2) + blockYOffset

                  // Try to extract font-size to calculate baseline offset (approx 0.35-0.4em)
                  const fontSizeMatch = sessionBlock.timeText.style.match(/font-size:([\d.]+)px/)
                  const fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 24
                  const baselineOffset = fontSize * 0.35

                  return centerY + baselineOffset
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
          ]
        : []),
      ...(sessionBlock.showTitle !== false && sessionBlock.titleZh.show !== false
        ? [
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
          ]
        : []),
      ...(sessionBlock.showTitle !== false && sessionBlock.titleEn.show !== false
        ? [
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
          ]
        : []),
      ...(sessionBlock.speaker.show !== false
        ? [
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
          ]
        : []),
      ...(session.type && sessionBlock.sessionType?.show !== false
        ? [
            (() => {
              const zhStyle = normalizeTextStyle(sessionBlock.sessionTypeZh.style)
              const enStyle = normalizeTextStyle(sessionBlock.sessionTypeEn.style)
              const zhFontSize = getFontSize(zhStyle, 14)
              const enFontSize = getFontSize(enStyle, 10)
              const zhLineHeight = getLineHeight(zhStyle)
              const enLineHeight = getLineHeight(enStyle)
              
              const zhShow = sessionBlock.sessionTypeZh.show !== false
              const enShow = sessionBlock.sessionTypeEn.show !== false
              const typeGap = sessionBlock.sessionType?.gap ?? 18
              const blockYOffset = sessionBlock.sessionType?.yOffset ?? 0
              
              const zhHeight = zhShow ? zhFontSize : 0
              const enHeight = enShow ? enFontSize : 0
              const effectiveGap = (zhShow && enShow) ? typeGap : 0
              const blockHeight = zhHeight + effectiveGap + enHeight
              
              const zhTopY = 0
              const enTopY = zhHeight + effectiveGap

              return {
                name: 'g',
                type: 'element',
                value: '',
                parent: null,
                attributes: {},
                children: [
                  ...(zhShow ? [{
                    name: 'text',
                    type: 'element',
                    value: '',
                    parent: null,
                    attributes: {
                      x: sessionBlock.sessionTypeZh.x,
                      y: getTextLineY(layout.y, layout.height, blockHeight, zhTopY + blockYOffset, zhFontSize, zhLineHeight, 0),
                      class: 'session-type',
                      'text-anchor': 'middle',
                      style: zhStyle,
                    },
                    children: [{
                      name: '',
                      type: 'text',
                      value: sessionTypeData?.zh?.name || session.type,
                      parent: null,
                      attributes: {},
                      children: [],
                    }],
                  }] : []),
                  ...(enShow ? [{
                    name: 'text',
                    type: 'element',
                    value: '',
                    parent: null,
                    attributes: {
                      x: sessionBlock.sessionTypeEn.x,
                      y: getTextLineY(layout.y, layout.height, blockHeight, enTopY + blockYOffset, enFontSize, enLineHeight, 0),
                      class: 'session-type',
                      'text-anchor': 'middle',
                      style: enStyle,
                    },
                    children: [{
                      name: '',
                      type: 'text',
                      value: sessionTypeData?.en?.name || session.type,
                      parent: null,
                      attributes: {},
                      children: [],
                    }],
                  }] : []),
                ]
              }
            })(),
          ]
        : []),
    ],
  }
}


function generateRoundedRectPath(x, y, w, h, rx, ry, corners) {
  const rTL = corners.includes('tl') ? rx : 0
  const rTR = corners.includes('tr') ? rx : 0
  const rBR = corners.includes('br') ? rx : 0
  const rBL = corners.includes('bl') ? rx : 0

  return [
    `M ${x + rTL},${y}`,
    `H ${x + w - rTR}`,
    rTR > 0 ? `A ${rTR},${ry} 0 0 1 ${x + w},${y + ry}` : `V ${y}`,
    `V ${y + h - rBR}`,
    rBR > 0 ? `A ${rBR},${ry} 0 0 1 ${x + w - rBR},${y + h}` : `H ${x + w}`,
    `H ${x + rBL}`,
    rBL > 0 ? `A ${rBL},${ry} 0 0 1 ${x},${y + h - ry}` : `V ${y + h}`,
    `V ${y + rTL}`,
    rTL > 0 ? `A ${rTL},${ry} 0 0 1 ${x + rTL},${y}` : '',
    'Z',
  ].join(' ')
}

function getSpeakerY(rowTop, rowHeight, speakerConfig, speakerCount, lineIndex = 0) {
  if (speakerCount === 0) {
    return rowTop + rowHeight / 2
  }

  const { blockHeight, fontSize, dy } = getSpeakerMetrics(speakerConfig, speakerCount)
  const blockTop = rowTop + (rowHeight - blockHeight) / 2
  return blockTop + fontSize + dy * lineIndex
}

export function getSessionLayout(session, schedule, config, y) {
  const speakerList = schedule.speakers || []
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const baseHeight = Number(config.rowHeight) || 0
  const speakerConfig = config.sessionBlock.speaker
  const sessionYPadding = getSessionVerticalPadding(config)
  const yPadding = Number(speakerConfig.yPadding) || 0
  const { blockHeight } = getSpeakerMetrics(speakerConfig, speakers.length)
  const speakerHeight = (speakers.length > 0 && speakerConfig.show !== false) ? blockHeight + yPadding * 2 : 0
  const titleLayout = config.sessionBlock.showTitle !== false ? getTitleLayout(session, config) : { zhLines: [], enLines: [], blockHeight: 0, topY: 0, enTopY: 0, zhFontSize: 0, zhLineHeight: 0, enFontSize: 0, enLineHeight: 0 }

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
  const titleGap = sessionBlock.titleBlock?.gap ?? 18
  const blockYOffset = sessionBlock.titleBlock?.yOffset ?? 0
  const zhShow = sessionBlock.titleZh.show !== false
  const enShow = sessionBlock.titleEn.show !== false
  const zhBlockHeight = zhShow ? getTextBlockHeight(zhLines.length, zhLineHeight, zhFontSize) : 0
  const enBlockHeight = enShow ? getTextBlockHeight(enLines.length, enLineHeight, enFontSize) : 0
  const effectiveGap = (zhShow && enShow) ? titleGap : 0
  const blockHeight = zhBlockHeight + effectiveGap + enBlockHeight

  const zhTopY = 0
  const enTopY = zhShow ? zhBlockHeight + titleGap : 0

  return {
    zhLines,
    enLines,
    zhLineHeight,
    enLineHeight,
    zhFontSize,
    enFontSize,
    blockHeight,
    topY: zhTopY + blockYOffset,
    enTopY: enTopY + blockYOffset,
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
  if (!fontFamily) return ''
  // 提取逗號分隔的第一個字體選項，避免向量軟體匯入時出錯
  return fontFamily.split(',')[0].trim()
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
