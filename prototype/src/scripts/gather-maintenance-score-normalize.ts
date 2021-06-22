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
import { normalizeFromList } from '../utils/math'

const prisma = new PrismaClient()

type Scores = {
  issueCloseSpeedScore: Decimal
  issueCommentByCollaboratorScore: Decimal
  abandonedScore: Decimal
}

const nameWithOwnerList = [
  { name: 'svelte', owner: 'sveltejs' },
  { name: 'react', owner: 'facebook' },
  { name: 'vue', owner: 'vuejs' },
] as const

type Frameworks = typeof nameWithOwnerList[number]['name']

/**
 * メンテナンスがされているかの指標(maintenance)を計算。正規化バージョン
 * 与えられたフレームワークの、直近100件のissueを収集する。
 * @see /images/maintenance.png
 */
async function main() {
  // 最後に正規化を行うために、各フレームワークの点数を格納しておく
  const frameworkWithScoreMap: Map<Frameworks, Scores> = new Map()

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

    // TODO: コラボレータが100人を超えることを想定して、ページングを行う必要がある。
    const collaboratorUserNameList =
      collaboratorResult.data?.organization?.membersWithRole?.edges?.flatMap(
        (edge) => edge?.node?.login ?? []
      ) ?? [] // ユーザーネームは@以降の文字列。

    issueResult.data?.repository?.issues.edges?.forEach((edge) => {
      const issue = edge?.node
      if (issue == null) return

      if (issue.closedAt) {
        // issue がどれくらい早く close されたか

        issueCloseSpeedScore = issueCloseSpeedScore.plus(
          new Decimal(1)
            .dividedBy(dayjs(issue.closedAt).diff(issue.createdAt, 'day') || 1)
            .dividedBy(dayjs().diff(issue.closedAt, 'day') || 1)
        )
      } else {
        // issue がどれくらい放置されているか

        // そのissueのコメントの長さの合計
        const sumOfCommentLength =
          issue.comments.nodes?.reduce((sum, comment) => sum + (comment?.body.length ?? 0), 0) ?? 0
        abandonedScore = abandonedScore.plus(
          new Decimal(sumOfCommentLength).dividedBy(
            dayjs(issue.createdAt).diff(dayjs().subtract(1, 'year'), 'day')
          )
        )
      }

      issue.comments.nodes?.forEach((comment) => {
        if (comment == null) return

        // コラボレータによるコメント
        if (collaboratorUserNameList.includes(comment.author?.login ?? '')) {
          issueCommentByCollaboratorScore = issueCommentByCollaboratorScore.plus(
            new Decimal(comment.body.length).dividedBy(
              dayjs().diff(comment.createdAt, 'day') || 1 // (コメントの文字数) / (コメントされてからの経過日数)
            )
          )
        }
      })
    })

    frameworkWithScoreMap.set(name, {
      issueCloseSpeedScore,
      issueCommentByCollaboratorScore,
      abandonedScore,
    })
  } // end of each framework loop

  // show result of each framework
  for (const { name } of nameWithOwnerList) {
    const thisFrameworkScores = frameworkWithScoreMap.get(name)
    if (thisFrameworkScores === undefined) continue

    const normalizedIssueCloseSpeedScore = normalizeFromList({
      target: thisFrameworkScores.issueCloseSpeedScore,
      list: Array.from(frameworkWithScoreMap.values()).map((v) => v.issueCloseSpeedScore),
    })
    const normalizedIssueCommentByCollaboratorScore = normalizeFromList({
      target: thisFrameworkScores.issueCommentByCollaboratorScore,
      list: Array.from(frameworkWithScoreMap.values()).map(
        (v) => v.issueCommentByCollaboratorScore
      ),
    })
    const normalizedAbandonedScore = normalizeFromList({
      target: thisFrameworkScores.abandonedScore,
      list: Array.from(frameworkWithScoreMap.values()).map((v) => v.abandonedScore),
    })

    console.log(`Framework name: ${name}
      ==unnormalized scores==
      issueCloseSpeedScore: ${thisFrameworkScores.issueCloseSpeedScore}
      issueCommentByCollaboratorScore: ${thisFrameworkScores.issueCommentByCollaboratorScore}
      abandonedScore: ${thisFrameworkScores.abandonedScore}

      ==normalized scores==
      issueCloseSpeedScore: ${normalizedIssueCloseSpeedScore}
      issueCommentByCollaboratorScore: ${normalizedIssueCommentByCollaboratorScore}
      abandonedScore: ${normalizedAbandonedScore}

      ==maintenanceScore==
      ${normalizedIssueCloseSpeedScore
        .plus(normalizedIssueCommentByCollaboratorScore)
        .minus(normalizedAbandonedScore)
        .dividedBy(3)}
      --------------------------------------------
    `)
  }

  // 2021/06/22
  // Framework name: svelte
  //       ==unnormalized scores==
  //       issueCloseSpeedScore: 5.9530875754746154091
  //       issueCommentByCollaboratorScore: 2847.9565746168499023
  //       abandonedScore: 132.95717083849159692

  //       ==normalized scores==
  //       issueCloseSpeedScore: 0.41614365024428782792
  //       issueCommentByCollaboratorScore: 1
  //       abandonedScore: 1

  //       ==maintenanceScore==
  //       0.13871455008142927597
  //       --------------------------------------------

  // Framework name: react
  //       ==unnormalized scores==
  //       issueCloseSpeedScore: 6.8289938570296604849
  //       issueCommentByCollaboratorScore: 2497.9160628928430786
  //       abandonedScore: 58.014450009019051416

  //       ==normalized scores==
  //       issueCloseSpeedScore: 1
  //       issueCommentByCollaboratorScore: 0.81268609739992062424
  //       abandonedScore: 0.42440887554327037192

  //       ==maintenanceScore==
  //       0.46275907395221675077
  //       --------------------------------------------

  // Framework name: vue
  //       ==unnormalized scores==
  //       issueCloseSpeedScore: 5.3287853178546943117
  //       issueCommentByCollaboratorScore: 979.21908708847628105
  //       abandonedScore: 2.7558566674173610589

  //       ==normalized scores==
  //       issueCloseSpeedScore: 0
  //       issueCommentByCollaboratorScore: 0
  //       abandonedScore: 0

  //       ==maintenanceScore==
  //       0
  //       --------------------------------------------
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
