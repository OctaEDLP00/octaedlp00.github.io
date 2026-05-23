export async function getLanguages(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching GitHub user data: ${response.statusText}`)
    }
    const data = (await response.json()) as Record<string, number>
    return data
  } catch (e: unknown) {
    console.error('Error fetching Languages data:', e)
    return null
  } finally {
    console.log('Finished fetching GitHub user data')
  }
}
