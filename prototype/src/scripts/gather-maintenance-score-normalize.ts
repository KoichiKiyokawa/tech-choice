import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { normalizeFromList } from '../utils/math'
import { Frameworks, FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { fetchIssueAndComments } from '../fetcher/fetch-issue-and-comment'
import { saveResultToFile } from '../utils/file'
import { MarkdownTable } from '../utils/table'
import { fetchCollaborators } from '../fetcher/fetch-collaborators'

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
  // 並列処理ですべてのフレームワークのデータを取得しておく
  const [allFrameworkCollaboratorList, allFrameworkIssuesList] = await Promise.all([
    Promise.all(FRAMEWORK_WITH_OWNER_LIST.map(({ owner }) => fetchCollaborators({ owner }))),
    Promise.all(FRAMEWORK_WITH_OWNER_LIST.map((fwo) => fetchIssueAndComments(fwo))),
  ])

  // 最後に正規化を行うために、各フレームワークの点数を格納しておくMap
  const frameworkWithScoreMap: Map<Frameworks, Scores> = new Map()

  // 各フレームワークの issueCloseSpeedScore, issueCommentByCollaboratorScore, abandonedScore を計算
  FRAMEWORK_WITH_OWNER_LIST.forEach(({ name }, i) => {
    const collaboratorUserNameList = allFrameworkCollaboratorList[i]
    const issueList = allFrameworkIssuesList[i]

    let issueCloseSpeedScore = new Decimal(0) // issueがどれくらい早くcloseされたかのスコア
    let issueCommentByCollaboratorScore = new Decimal(0) // コラボレータによるissueコメントのスコア
    let abandonedScore = new Decimal(0) // どれくらい放置されているかを表す指標

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
  }) // end of each framework loop

  // show result of each framework
  const headers = [
    'frameworkName',
    'issueCloseSpeedScore',
    'issueCommentByCollaboratorScore',
    'abandonedScore',
    'maintenanceScore',
  ] as const

  const unnormalizedScoresTable = new MarkdownTable('UnnormalizedScores', headers)
  const normalizedScoresTable = new MarkdownTable('NormalizedScores', headers)

  for (const { name } of FRAMEWORK_WITH_OWNER_LIST) {
    const thisFrameworkScores = frameworkWithScoreMap.get(name)
    if (thisFrameworkScores === undefined) continue

    unnormalizedScoresTable.addRow({
      frameworkName: name,
      ...thisFrameworkScores,
      maintenanceScore: '-',
    })

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

    normalizedScoresTable.addRow({
      frameworkName: name,
      issueCloseSpeedScore: normalizedIssueCloseSpeedScore,
      issueCommentByCollaboratorScore: normalizedIssueCommentByCollaboratorScore,
      abandonedScore: normalizedAbandonedScore,
      maintenanceScore,
    })

    saveResultToFile(
      `${unnormalizedScoresTable}\n\n${normalizedScoresTable}`,
      'gather-maintenance-score-normalize'
    )
  }
}

main().catch(console.error)
