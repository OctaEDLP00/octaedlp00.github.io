import type { GithubRepositories } from '~/types'

export async function getRepo(username: string, repoName: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`)
    if (!response.ok) {
      throw new Error(`Error al obtener los repositorios: ${response.statusText}`)
    }
    const data = await (response.json() as Promise<Array<GithubRepositories>>)
    return data.find(({ name, fork }) => !fork && name == repoName)
  } catch (e: unknown) {
    console.error('Error fetching repository data:', e)
    return null
  } finally {
    console.log('Finalizada la obtención de repositorios')
  }
}
