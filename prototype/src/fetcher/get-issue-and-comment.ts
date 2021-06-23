import {
  GetIssueAndComments,
  GetIssueAndCommentsQuery,
  GetIssueAndCommentsQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'
import { withinOneYear } from '../utils/date'

type Issue = NonNullable<
  NonNullable<NonNullable<GetIssueAndCommentsQuery['repository']>['issues']['edges']>[number]
>['node']

export async function getIssueAndComments({
  name,
  owner,
}: {
  name: string
  owner: string
}): Promise<Issue[]> {
  let dataList: Issue[] = []
  const d: { cursor: string | undefined } = { cursor: undefined } // letだとなぜかファイル全体に型エラーが出るため、constで避ける

  while (true) {
    const result = await urql
      .query<GetIssueAndCommentsQuery, GetIssueAndCommentsQueryVariables>(GetIssueAndComments, {
        name,
        owner,
        after: d.cursor,
      })
      .toPromise()

    const issueEdges = result.data?.repository?.issues.edges
    if (issueEdges == null) break

    const data = issueEdges.flatMap((edge) => edge?.node ?? [])

    // 直近1年のissueのみをデータに追加
    dataList = dataList.concat(data.filter((d) => withinOneYear(d.createdAt)))

    // 直近1年以外のデータが混じっていれば処理終了(新しい順にデータが取得できるようにクエリを書いている前提)
    if (data.some((d) => !withinOneYear(d?.closedAt))) break

    d.cursor = result.data?.repository?.issues.edges?.splice(-1)[0]?.cursor
  }

  return dataList
}
