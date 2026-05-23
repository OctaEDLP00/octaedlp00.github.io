import type { GithubAPIResponse } from '~/types'

export class Convert {
  public static toGithubAPIResponse(json: string): GithubAPIResponse {
    return JSON.parse(json)
  }

  public static githubAPIResponseToJson(value: GithubAPIResponse): string {
    return JSON.stringify(value)
  }
}
