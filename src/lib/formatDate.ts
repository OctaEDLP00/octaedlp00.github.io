/**
 * Formats a date string to Spanish locale
 * @param {string} dateOrStr
 * @returns {string}
 */
export const formatDate = (dateOrStr: string | Date): string => {
  if (typeof dateOrStr !== 'string' && dateOrStr instanceof Date) {
    return dateOrStr.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return new Date(dateOrStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
