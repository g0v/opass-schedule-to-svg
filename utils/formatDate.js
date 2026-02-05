/**
 * @param {Date|string} date
 */
export function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date)
  const y = parts.find(p => p.type === 'year').value
  const m = parts.find(p => p.type === 'month').value
  const d = parts.find(p => p.type === 'day').value

  return `${y}-${m}-${d}`
}
