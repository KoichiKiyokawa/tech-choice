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

    const collaboratorUserNames =
      result.data?.organization?.membersWithRole?.nodes?.flatMap((member) => member?.name ?? []) ??
      []

    result.data?.repository?.issues.nodes?.forEach((issue) => {
      if (issue == null) return

      if (issue.closedAt) {
        // issue がどれくらい早く close されたか

        issueCloseSpeedScore = issueCloseSpeedScore.plus(
          new Decimal(1).dividedBy(
            new Decimal(dayjs(issue.closedAt).diff(issue.createdAt, 'day') || 1).dividedBy(
              new Decimal(dayjs().diff(issue.closedAt, 'day') || 1)
            )
          )
        )
      } else {
        // issue がどれくらい放置されているか
        abandonedScore = abandonedScore.plus(
          new Decimal(issue.comments.nodes?.length ?? 0).dividedBy(
            new Decimal(dayjs(issue.createdAt).diff(dayjs().subtract(1, 'year')))
          )
        )
      }

      issue.comments.nodes?.forEach((comment) => {
        if (comment == null) return

        // コラボレータによるコメント
        const commentedUsername = comment.author?.login
        if (collaboratorUserNames.includes(commentedUsername ?? '')) {
          issueCommentByCollaboratorScore = issueCommentByCollaboratorScore.plus(
            new Decimal(comment.body.length).dividedBy(
              new Decimal(dayjs().diff(comment.createdAt, 'day') || 1) // (コメントの文字数) / (コメントされてからの経過日数)
            )
          )
        }
      })
    })

    const maintenanceScore = issueCloseSpeedScore
      .plus(issueCommentByCollaboratorScore)
      .minus(abandonedScore)

    console.log(`${name}: ${maintenanceScore}`)
    // 2021/06/15
    // svelte: 1198.1675907288450666
    // react: 1332.2460925015563767
    // vue: 3438.9746031743054658
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
