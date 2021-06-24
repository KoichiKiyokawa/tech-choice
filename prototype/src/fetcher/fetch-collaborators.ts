import {
  GetCollaborators,
  GetCollaboratorsQuery,
  GetCollaboratorsQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'

/**
 * @param owner リポジトリのオーナー名
 * @returns コラボレータの名前が入った配列
 */
export async function fetchCollaborators({ owner }: { owner: string }): Promise<string[]> {
  const result = await urql
    .query<GetCollaboratorsQuery, GetCollaboratorsQueryVariables>(GetCollaborators, {
      owner,
    })
    .toPromise()

  return (
    result.data?.organization?.membersWithRole?.edges?.flatMap((edge) => edge?.node?.login ?? []) ??
    []
  )
}
