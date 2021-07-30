import { last } from 'rhodash'
import { GetStargazer, GetStargazerQuery, GetStargazerQueryVariables } from '../generated/graphql'
import { urql } from '../modules/urql'
import { DateISOstring } from '../types/date'
import { withinOneYear } from '../utils/date'

export type StarHistory = {
  id: string
  starredAt: DateISOstring
}

/**
 * スターされた日付の履歴を新しい順に取得する
 * @param name フレームワーク名
 * @param owner リポジトリのオーナー名
 * @returns e.g. ['2021-07-13T04:11:33Z', '2021-07-13T03:51:42Z', '2021-07-13T03:22:56Z', ...]
 */
export async function fetchStarredAtList({
  name,
  owner,
}: {
  name: string
  owner: string
}): Promise<StarHistory[]> {
  const starredAtList: StarHistory[] = []
  const cursor: { value?: string } = {}

  loop: while (true) {
    const result = await urql
      .query<GetStargazerQuery, GetStargazerQueryVariables>(GetStargazer, {
        name,
        owner,
        after: cursor.value,
      })
      .toPromise()
    const edges = result.data?.repository?.stargazers.edges
    if (edges == null) return []

    const starredAtListInThisLoop: StarHistory[] =
      edges.flatMap((edge) => (edge ? { starredAt: edge.starredAt, id: edge.cursor } : [])) ?? []
    for (const history of starredAtListInThisLoop) {
      // 直近一年分のみを格納
      if (withinOneYear(history.starredAt)) starredAtList.push(history)
      else break loop // 一年以上前のデータが混じっていたら、処理終了(新しい順に取得しているため)
    }

    cursor.value = last(edges)?.cursor
  }

  return starredAtList
}

// fetchStarredAtList({ name: 'svelte', owner: 'sveltejs' }).then(console.log)
