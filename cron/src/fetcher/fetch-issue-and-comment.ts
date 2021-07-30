import {
  GetIssueAndComments,
  GetIssueAndCommentsQuery,
  GetIssueAndCommentsQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'
import { withinOneYear } from '../utils/date'
import { last } from 'rhodash'

type Issue = NonNullable<
  NonNullable<NonNullable<GetIssueAndCommentsQuery['repository']>['issues']['edges']>[number]
>['node']

export async function fetchIssueAndComments({
  name,
  owner,
}: {
  name: string
  owner: string
}): Promise<Issue[]> {
  let dataList: Issue[] = []
  const cursor: { value: string | undefined } = { value: undefined } // letだとなぜかファイル全体に型エラーが出るため、constで避ける

  loop: while (true) {
    const result = await urql
      .query<GetIssueAndCommentsQuery, GetIssueAndCommentsQueryVariables>(GetIssueAndComments, {
        name,
        owner,
        after: cursor.value,
      })
      .toPromise()

    const issueEdges = result.data?.repository?.issues.edges
    if (issueEdges == null) break

    const data = issueEdges.flatMap((edge) => edge?.node ?? [])

    for (const d of data) {
      // 直近1年のissueのみをデータに追加
      if (withinOneYear(d.createdAt)) dataList.push(d)
      else break loop // 直近1年以外のデータが混じっていれば処理終了(新しい順にデータが取得できるようにクエリを書いている前提)
    }

    cursor.value = last(issueEdges)?.cursor
  }

  return dataList
}

// fetchIssueAndComments({ name: 'svelte', owner: 'sveltejs' })
//   .then((res) => {
//     console.log(res.length)
//     fs.writeFileSync('res.json', JSON.stringify(res))
//   })
//   .catch(console.error)
