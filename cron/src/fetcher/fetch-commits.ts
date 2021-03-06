import dayjs from 'dayjs'
import { last } from 'rhodash'
import {
  GetCommitHistory,
  GetCommitHistoryQuery,
  GetCommitHistoryQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'
import { DateISOstring } from '../types/date'
import { withinOneYear } from '../utils/date'

type Commit = { id: string; committedDate: DateISOstring; additions: number; deletions: number }

/**
 * コミットを新しい順に取得していく。一年以上前のコミットが取得された時点で処理を止める
 * @param lastCommittedAt これよりも新しいコミットのみを取得する
 **/
export async function fetchCommits({
  name,
  owner,
  lastCommittedAt,
}: {
  name: string
  owner: string
  lastCommittedAt?: Date
}) {
  const commitList: Commit[] = []
  const cursor: { value?: string } = {}

  loop: while (true) {
    const result = await urql
      .query<GetCommitHistoryQuery, GetCommitHistoryQueryVariables>(GetCommitHistory, {
        name,
        owner,
        after: cursor.value,
      })
      .toPromise()

    const target = result.data?.repository?.defaultBranchRef?.target
    if (target?.__typename !== 'Commit') break

    const edges = target.history.edges
    if (edges == null) break

    for (const edge of edges) {
      const commit = edge?.node
      if (commit == null) continue

      if (
        withinOneYear(commit.committedDate) ||
        dayjs(commit.committedDate).isBefore(lastCommittedAt, 'hour') // undefinedが渡されたときはfalseになる
      )
        commitList.push({
          id: commit.id,
          additions: commit.additions,
          deletions: commit.deletions,
          committedDate: commit.committedDate,
        })
      else break loop
    }

    cursor.value = last(edges)?.cursor
  }

  return commitList
}

// fetchCommits({ name: 'svelte', owner: 'sveltejs' }).then((res) => {
//   saveResultToFile(JSON.stringify(res), 'fetch-commits')
// })
