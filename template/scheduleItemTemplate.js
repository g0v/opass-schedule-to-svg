export const ROW_HEIGHT = 124

export function scheduleItemTemplate(i, session, speakerList) {
  const speakers = session.speakers.map(speakerId => speakerList.find(s => s.id === speakerId)).filter(Boolean)
  const startDate = new Date(session.start)
  const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`

  return {
    name: 'g',
    type: 'element',
    value: '',
    parent: null,
    attributes: {
      width: '1080',
      height: 'sessionHeight'
    },
    children: [
      {
        name: 'rect',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          y: ROW_HEIGHT * i,
          width: '1080',
          height: ROW_HEIGHT,
          stroke: 'black',
          fill: '#ffffff'
        },
        children: []
      },
      {
        name: 'rect',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: '45.1',
          y: ROW_HEIGHT * i,
          width: '101.3',
          height: '36.8',
          rx: '10',
          ry: '10',
          fill: '#8DA4BE'
        },
        children: []
      },
      {
        name: 'text',
        type: 'element',
        value: '',
        parent: null,
        attributes: {
          x: '95.75',
          y: ROW_HEIGHT * i + 27,
          class: 'time',
          'text-anchor': 'middle',
          style: 'font-family:&#x27;Onest-Regular_SemiBold&#x27;, &#x27;Onest&#x27;;font-size:24.1px'
        },
        children: [
          {
            name: '',
            type: 'text',
            value: startTime,
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
          x: '342.1',
          y: ROW_HEIGHT * i + 62,
          class: 'title',
          style: 'font-family:&#x27;NotoSansTC-Regular&#x27;, &#x27;Noto Sans TC&#x27;, sans-serif;font-size:17.8px'
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
          x: '342.1',
          y: ROW_HEIGHT * i + 80,
          class: 'title',
          style: 'font-family:&#x27;Onest-Regular_Regular&#x27;, &#x27;Onest&#x27;;font-size:13.3px'
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
          x: '863.8',
          y: Math.max(2, ROW_HEIGHT * i + (ROW_HEIGHT - 28 * speakers.length) / 2),
          class: 'speaker'
        },
        children: speakers.map(speaker => ({
          name: 'tspan',
          type: 'element',
          value: '',
          parent: null,
          attributes: {
            x: '863.8',
            dy: '24'
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
