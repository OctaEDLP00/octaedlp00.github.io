/**
 *
 * @param langObj
 * @param limit
 * @returns
 */
export function getTopLanguages(langObj: Record<string, number>, limit = 3) {
  const entries = Object.entries(langObj || {})
  if (entries.length === 0) return []

  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0)
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([lang, bytes]) => ({
      name: lang,
      percentage: Math.round((bytes / total) * 100),
    }))
}
