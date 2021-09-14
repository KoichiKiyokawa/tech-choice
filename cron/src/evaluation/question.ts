import { Question, IssueComment, Issue } from '@prisma/client'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { fixedLastCalculatedAt } from '../constants/date'
import { calcAgingScore } from '../utils/date'

type IssueWithComment = Issue & { issueComments: IssueComment[] }

export function calcInfoShareActivityForSepcificFramework({
  questions,
  issueWithCommentList,
}: {
  questions: Question[]
  issueWithCommentList: IssueWithComment[]
}) {
  const questionScore = calcQuestionScoreForSpecificFramework({ questions })
  const issueAskScore = calcIssueAskScoreForSpecificFramework({ issueWithCommentList })

  return questionScore.plus(issueAskScore)
}

/** @private */
function calcQuestionScoreForSpecificFramework({ questions }: { questions: Question[] }): Decimal {
  let result = new Decimal(0)

  for (const question of questions) {
    const eachScore = new Decimal(question.answerCount).times(
      calcAgingScore(dayjs(fixedLastCalculatedAt).diff(question.askedAt)),
    )
    result = result.plus(eachScore)
  }

  return result
}

/**
 * issueへのコメント数によるスコアづけ
 * TODO: questionラベルがついているものに絞り込んだほうが良いかもしれない。
 * TODO: コラボレータ以外のコメントに絞り込んだほうが良いかもしれない。
 * */
function calcIssueAskScoreForSpecificFramework({
  issueWithCommentList: issues,
}: {
  issueWithCommentList: IssueWithComment[]
}): Decimal {
  let result = new Decimal(0)

  // コメント文字数 x AGING_SCORE
  for (const issue of issues) {
    const eachIssueScore = calcAgingScore(dayjs(fixedLastCalculatedAt).diff(issue.openedAt)).times(
      issue.issueComments.reduce(
        (total, comment) => total.plus(comment.body.length),
        new Decimal(0),
      ),
    )
    result = result.plus(eachIssueScore)
  }

  return result
}
