/**
 * @param {Date|string} date
 */
export function formatTime(date) {
  if (typeof date === 'string') {
    date = new Date(date)
  }

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}
