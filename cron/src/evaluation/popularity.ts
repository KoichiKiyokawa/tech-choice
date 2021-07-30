import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { calcAgingScore } from '../utils/date'

export function calcPopularityScoreForSpecificFramework({
  downloadHistories,
  starHistories,
}: {
  downloadHistories: {
    count: number
    downloadedAt: Date
  }[]
  starHistories: { starredAt: Date }[]
}): Decimal {
  let result = new Decimal(0)
  for (const { count, downloadedAt } of downloadHistories) {
    const eachDayScore = new Decimal(count).times(calcAgingScore(dayjs().diff(downloadedAt, 'day')))
    result = result.plus(eachDayScore)
  }

  for (const { starredAt } of starHistories) {
    const eachDayScore = new Decimal(1).times(calcAgingScore(dayjs().diff(starredAt, 'day')))
    result = result.plus(eachDayScore)
  }

  return result
}
