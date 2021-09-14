import { Commit } from '@prisma/client'
import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { fixedLastCalculatedAt } from '../constants/date'
import { calcAgingScore } from '../utils/date'

export function calcActivityScoreForSpecificFramework(commitList: Commit[]): Decimal {
  return commitList.reduce(
    (sum, commit) =>
      sum.plus(
        new Decimal(commit.additions + commit.deletions).times(
          calcAgingScore(dayjs(fixedLastCalculatedAt).diff(commit.committedAt, 'day')),
        ),
      ),
    new Decimal(0),
  )
}
