import { Issue, IssueComment } from '@prisma/client'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { calcAgingScore } from '../utils/date'

/**
 * あるフレームワークのメンテナンスのサブスコアを計算する。
 * 正規化などはしない。
 * @param {Object} arg
 * @param {string[]} arg.collaboratorUserNameList コラボレータの名前が格納された配列
 * @param {string[]} arg.issueList issue(コメントが紐付いている)の配列
 */
export function calcMaintenanceSubScoresForSpecificFramework({
  collaboratorUserNameList,
  issueList,
}: {
  collaboratorUserNameList: string[]
  issueList: (Issue & {
    issueComments: IssueComment[]
  })[]
}): {
  issueCloseSpeedScore: Decimal // issueがどれくらい早くcloseされたかのスコア
  issueCommentByCollaboratorScore: Decimal // コラボレータによるissueコメントのスコア
  abandonedScore: Decimal // どれくらい放置されているかを表す指標
} {
  let issueCloseSpeedScore = new Decimal(0)
  let issueCommentByCollaboratorScore = new Decimal(0)
  let abandonedScore = new Decimal(0)

  issueList.forEach((issue) => {
    if (issue.closedAt) {
      // issue がどれくらい早く close されたか

      issueCloseSpeedScore = issueCloseSpeedScore.plus(
        new Decimal(1)
          .times(calcAgingScore(dayjs(issue.closedAt).diff(issue.openedAt, 'day')))
          .times(calcAgingScore(dayjs().diff(issue.closedAt, 'day'))),
      )
    } else {
      // issue がどれくらい放置されているか

      // そのissueのコメントの長さの合計
      const sumOfCommentLength =
        issue.issueComments.reduce((sum, comment) => sum + comment.body.length, 0) ?? 0
      abandonedScore = abandonedScore.plus(
        new Decimal(sumOfCommentLength).times(
          calcAgingScore(dayjs(issue.openedAt).diff(dayjs().subtract(1, 'year'), 'day')),
        ),
      )
    }

    issue.issueComments.forEach((comment) => {
      // コラボレータによるコメント
      if (collaboratorUserNameList.includes(comment.author)) {
        issueCommentByCollaboratorScore = issueCommentByCollaboratorScore.plus(
          new Decimal(comment.body.length).times(
            calcAgingScore(dayjs().diff(comment.postedAt, 'day')),
          ),
        )
      }
    })
  })

  return { issueCloseSpeedScore, issueCommentByCollaboratorScore, abandonedScore }
}
