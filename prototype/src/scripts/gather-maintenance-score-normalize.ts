import { PrismaClient } from '@prisma/client'
import {
  GetCollaborators,
  GetCollaboratorsQuery,
  GetCollaboratorsQueryVariables,
} from '../generated/graphql'
import { urql } from '../modules/urql'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { normalizeFromList } from '../utils/math'
import { Frameworks, FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { fetchIssueAndComments } from '../fetcher/fetch-issue-and-comment'
import { saveResultToFile } from '../utils/file'

const prisma = new PrismaClient()

type Scores = {
  issueCloseSpeedScore: Decimal
  issueCommentByCollaboratorScore: Decimal
  abandonedScore: Decimal
}

/**
 * メンテナンスがされているかの指標(maintenance)を計算。正規化バージョン
 * 与えられたフレームワークの、直近100件のissueを収集する。
 * @see /images/maintenance.png
 */
async function main() {
  // 最後に正規化を行うために、各フレームワークの点数を格納しておく
  const frameworkWithScoreMap: Map<Frameworks, Scores> = new Map()

  for (const { name, owner } of FRAMEWORK_WITH_OWNER_LIST) {
    const collaboratorResult = await urql
      .query<GetCollaboratorsQuery, GetCollaboratorsQueryVariables>(GetCollaborators, {
        owner,
      })
      .toPromise()
    const issueList = await fetchIssueAndComments({ name, owner })

    let issueCloseSpeedScore = new Decimal(0) // issueがどれくらい早くcloseされたかのスコア
    let issueCommentByCollaboratorScore = new Decimal(0) // コラボレータによるissueコメントのスコア
    let abandonedScore = new Decimal(0) // どれくらい放置されているかを表す指標

    // TODO: コラボレータが100人を超えることを想定して、ページングを行う必要がある。
    const collaboratorUserNameList =
      collaboratorResult.data?.organization?.membersWithRole?.edges?.flatMap(
        (edge) => edge?.node?.login ?? []
      ) ?? [] // ユーザーネームは@以降の文字列。

    issueList.forEach((issue) => {
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
            dayjs(issue.createdAt).diff(dayjs().subtract(1, 'year'), 'day') || 1
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
  const headers = [
    '| Framework name | issueCloseSpeedScore | issueCommentByCollaboratorScore | abandonedScore | maintenanceScore |',
    '|---|---|---|---|---|',
  ]
  const unnormalizedScoresTable: string[] = [...headers]
  const normalizedScoresTable: string[] = [...headers]

  for (const { name } of FRAMEWORK_WITH_OWNER_LIST) {
    const thisFrameworkScores = frameworkWithScoreMap.get(name)
    if (thisFrameworkScores === undefined) continue

    unnormalizedScoresTable.push(
      `| ${name} | ${thisFrameworkScores.issueCloseSpeedScore} | ${thisFrameworkScores.issueCommentByCollaboratorScore} | ${thisFrameworkScores.abandonedScore} | - |`
    )

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

    const maintenanceScore = normalizedIssueCloseSpeedScore
      .plus(normalizedIssueCommentByCollaboratorScore)
      .minus(normalizedAbandonedScore)

    normalizedScoresTable.push(
      `| ${name} | ${normalizedIssueCloseSpeedScore} | ${normalizedIssueCommentByCollaboratorScore} | ${normalizedAbandonedScore} | ${maintenanceScore} |`
    )

    const result = `# UnnormalizedScores

${unnormalizedScoresTable.join('\n')}

# NormalizedScores

${normalizedScoresTable.join('\n')}`

    saveResultToFile(result, 'gather-maintenance-score-normalize')
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
