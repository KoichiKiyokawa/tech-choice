import { last } from 'rhodash'
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
  const collaboratorList: string[] = []
  const cursor: { value?: string } = {}

  while (true) {
    const result = await urql
      .query<GetCollaboratorsQuery, GetCollaboratorsQueryVariables>(GetCollaborators, {
        owner,
        after: cursor.value,
      })
      .toPromise()

    const edges = result.data?.organization?.membersWithRole.edges
    if (edges == null) break

    const collaborators = edges.flatMap((edge) => edge?.node?.login ?? [])

    if (collaborators.length) collaboratorList.push(...collaborators)
    else break // それ以上データを取得できなくなったら終了

    cursor.value = last(edges)?.cursor
  }

  return collaboratorList
}

// fetchCollaborators({ owner: 'facebook' }).then((res) => {
//   console.log(res)
//   console.log(res.length)
// })
