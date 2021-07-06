import { PrismaClient } from '@prisma/client'
import {
  GetCollaborators,
  GetCollaboratorsQuery,
  GetCollaboratorsQueryVariables,
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
    const collaboratorResult = await urql
      .query<GetCollaboratorsQuery, GetCollaboratorsQueryVariables>(GetCollaborators, {
        owner,
      })
      .toPromise()

    const issueResult = await urql
      .query<GetIssueAndCommentsQuery, GetIssueAndCommentsQueryVariables>(GetIssueAndComments, {
        name,
        owner,
      })
      .toPromise()

    let issueCloseSpeedScore = new Decimal(0) // issueがどれくらい早くcloseされたかのスコア
    let issueCommentByCollaboratorScore = new Decimal(0) // コラボレータによるissueコメントのスコア
    let abandonedScore = new Decimal(0) // どれくらい放置されているかを表す指標

    // コラボレータが100人を超えることを想定して、ページングを行う必要がある。
    const collaboratorUserNameList =
      collaboratorResult.data?.organization?.membersWithRole.edges?.flatMap(
        (edge) => edge?.node?.login ?? [],
      ) ?? [] // ユーザーネームは@以降の文字列。

    issueResult.data?.repository?.issues.edges?.forEach((edge) => {
      const issue = edge?.node
      if (issue == null) return

      if (issue.closedAt) {
        // issue がどれくらい早く close されたか

        issueCloseSpeedScore = issueCloseSpeedScore.plus(
          new Decimal(1)
            .dividedBy(new Decimal(dayjs(issue.closedAt).diff(issue.createdAt, 'day') || 1))
            .dividedBy(new Decimal(dayjs().diff(issue.closedAt, 'day') || 1)),
        )
      } else {
        // issue がどれくらい放置されているか

        // そのissueのコメントの長さの合計
        const sumOfCommentLength =
          issue.comments.nodes?.reduce((sum, comment) => sum + (comment?.body.length ?? 0), 0) ?? 0
        abandonedScore = abandonedScore.plus(
          new Decimal(sumOfCommentLength).dividedBy(
            new Decimal(dayjs(issue.createdAt).diff(dayjs().subtract(1, 'year'), 'day')),
          ),
        )
      }

      issue.comments.nodes?.forEach((comment) => {
        if (comment == null) return

        // コラボレータによるコメント
        if (collaboratorUserNameList.includes(comment.author?.login ?? '')) {
          issueCommentByCollaboratorScore = issueCommentByCollaboratorScore.plus(
            new Decimal(comment.body.length).dividedBy(
              new Decimal(dayjs().diff(comment.createdAt, 'day') || 1), // (コメントの文字数) / (コメントされてからの経過日数)
            ),
          )
        }
      })
    })

    const maintenanceScore = issueCloseSpeedScore
      .plus(issueCommentByCollaboratorScore)
      .minus(abandonedScore)

    console.log(
      `${name}: issueCloseSpeedScore ${issueCloseSpeedScore} issueCommentByCollaboratorScore: ${issueCommentByCollaboratorScore} abandonedScore: ${abandonedScore} maintenanceScore: ${maintenanceScore}`,
    )
    // 2021/06/15
    // svelte: issueCloseSpeedScore 7.3179761155025682246 issueCommentByCollaboratorScore: 2906.4107723263815099 abandonedScore: 109.1365376274718156 maintenanceScore: 2804.5922108144122625
    // react: issueCloseSpeedScore 9.1227293358383321865 issueCommentByCollaboratorScore: 2947.0434065934065935 abandonedScore: 73.791852497685597002 maintenanceScore: 2882.3742834315593287
    // vue: issueCloseSpeedScore 7.4475592059612232167 issueCommentByCollaboratorScore: 1194.7974797704577426 abandonedScore: 5.7447969465895921323 maintenanceScore: 1196.5002420298293737
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
