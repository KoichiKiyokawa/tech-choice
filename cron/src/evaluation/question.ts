import { IssueComment, Question } from '@prisma/client'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { fixedLastCalculatedAt } from '../constants/date'
import { calcAgingScore } from '../utils/date'

export function calcInfoShareActivityForSepcificFramework({
  questions,
  issueComments,
}: {
  questions: Question[]
  issueComments: IssueComment[]
}) {
  const questionScore = calcQuestionScoreForSpecificFramework({ questions })
  const issueAskScore = calcIssueAskScoreForSpecificFramework({ issueComments })

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
  issueComments,
}: {
  issueComments: IssueComment[]
}): Decimal {
  let result = new Decimal(0)

  // コメント文字数 x AGING_SCORE
  for (const comment of issueComments) {
    const eachScore = calcAgingScore(dayjs(fixedLastCalculatedAt).diff(comment.postedAt)).times(
      comment.body.length,
    )
    result = result.plus(eachScore)
  }

  return result
}
