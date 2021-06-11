import { PrismaClient } from '@prisma/client'
import {
  GetIssueAndComments,
  GetIssueAndCommentsQuery,
  GetIssueAndCommentsQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'

const prisma = new PrismaClient()

/**
 * メンテナンスがされているかの指標(maintenance)を計算
 * 与えられたフレームワークの、直近100件のissueを収集する。
 * @see /images/maintenance.png
 */
async function main() {
  const nameWithOwnerList: { name: string; owner: string }[] = [
    { name: 'svelte', owner: 'sveltejs' },
    { name: 'react', owner: 'facebook' },
    { name: 'vue', owner: 'vuejs' },
  ]

  for (const { name, owner } of nameWithOwnerList) {
    const result = await urql
      .query<GetIssueAndCommentsQuery, GetIssueAndCommentsQueryVariables>(GetIssueAndComments, {
        name,
        owner,
      })
      .toPromise()

    let issueCloseSpeedScore = new Decimal(0) // issueがどれくらい早くcloseされたかのスコア
    let issueCommentByCollaboratorScore = new Decimal(0) // コラボレータによるissueコメントのスコア
    let abandonedScore = new Decimal(0) // どれくらい放置されているかを表す指標

    result.data?.repository?.issues.nodes?.forEach((issue) => {
      issue?.comments.nodes?.forEach((comment) => {
        // TODO
      })
    })

    const maintenanceScore = issueCloseSpeedScore
      .plus(issueCommentByCollaboratorScore)
      .minus(abandonedScore)

    console.log(`${name}: ${maintenanceScore}`)
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
