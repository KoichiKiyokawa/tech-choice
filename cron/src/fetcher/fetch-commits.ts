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

export async function fetchCommits({ name, owner }: { name: string; owner: string }) {
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

      if (withinOneYear(commit.committedDate))
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
