/**
 * @param {Date|string} date
 */
export function formatTime(date) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const h = parts.find(p => p.type === 'hour').value
  const m = parts.find(p => p.type === 'minute').value

  return `${h}:${m}`
}
