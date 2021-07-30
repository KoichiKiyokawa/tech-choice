import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import {
  GetCommitHistory,
  GetCommitHistoryQuery,
  GetCommitHistoryQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'

const prisma = new PrismaClient()

/**
 * 与えられたフレームワークの、直近1年のコミットとを収集する。
 * @example `ts-node scripts/gather-commit.ts`
 */
async function main() {
  const nameWithOwnerList: { name: string; owner: string }[] = [
    { name: 'svelte', owner: 'sveltejs' },
    { name: 'react', owner: 'facebook' },
    { name: 'vue', owner: 'vuejs' },
  ]

  for (const { name, owner } of nameWithOwnerList) {
    const result = await urql
      .query<GetCommitHistoryQuery, GetCommitHistoryQueryVariables>(GetCommitHistory, {
        name,
        owner,
      })
      .toPromise()
    const target = result.data?.repository?.defaultBranchRef?.target
    if (target?.__typename === 'Commit') {
      const score = target.history.edges
        ?.flatMap((edge) => {
          const commit = edge?.node
          if (commit == null) return []

          return new Decimal(commit.additions + commit.deletions).dividedBy(
            Math.abs(dayjs(commit.committedDate).diff(new Date(), 'day')) || 1,
          ) // avoid to devide 0 (instead, deviding 1)
        })
        .reduce((sum, c) => sum.plus(c), new Decimal(0))

      console.log(`${name}: ${score}, commitCount: ${target.history.edges?.length}`)
    }
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
