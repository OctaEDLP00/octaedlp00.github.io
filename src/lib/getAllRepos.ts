import type { GithubRepositories } from '~/types'

export async function getAllRepos(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
    if (!response.ok) {
      throw new Error(`Error al obtener los repositorios: ${response.statusText}`)
    }
    const data = await (response.json() as Promise<Array<GithubRepositories>>)
    return data
  } catch (e: unknown) {
    console.error('Error fetching repository data:', e)
    return null
  } finally {
    console.log('Finalizada la obtención de repositorios')
  }
}
