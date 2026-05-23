import type { GithubAPIResponse } from '~/types'

export async function getInfoGithubAPI(username: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`)
    if (!response.ok) {
      throw new Error(`Error fetching GitHub user data: ${response.statusText}`)
    }
    const { login, avatar_url, name, bio, public_repos, followers } =
      (await response.json()) as GithubAPIResponse
    return { login, avatar_url, name, bio, public_repos, followers }
  } catch (e: unknown) {
    console.error('Error fetching GitHub user data:', e)
    return null
  } finally {
    console.log('Finished fetching GitHub user data')
  }
}
