export async function getLangsRepo(repo: string) {
  try {
    const langResponse = await fetch(repo)
    if (!langResponse.ok) {
      throw new Error(`Error fetching languages data: ${langResponse.statusText}`)
    }
    const data = await (langResponse.json() as Promise<Record<string, number>>)
    return data
  } catch (e: unknown) {
    console.error('Error fetching languages data:', e)
    return null
  } finally {
    console.log('Finished fetching languages data')
  }
}
