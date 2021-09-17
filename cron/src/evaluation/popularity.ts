import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { fixedLastCalculatedAt } from '../constants/date'
import { calcAgingScore } from '../utils/date'

/**
 * ダウンロード数は指数関数的に増えるため、人気度はその逆関数であるlogを使って算出する
 * そのlogの底を表す定数
 */
const DOWNLOAD_BASE_OF_LOGARITHM = 1.3

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
    // ダウンロード数は指数関数的に増えるため、人気度はその逆関数であるlogを使って算出する。
    // logの底が第2引数にくることに注意 cf) https://mikemcl.github.io/decimal.js/#Dlog
    // e.g. new Decimal(4).log(2) => log_2{4} = 2
    const loosenedScore =
      count >= 1 ? new Decimal(count).log(DOWNLOAD_BASE_OF_LOGARITHM) : new Decimal(0)
    const eachDayScore = loosenedScore.times(
      calcAgingScore(dayjs(fixedLastCalculatedAt).diff(downloadedAt, 'day')),
    )

    result = result.plus(eachDayScore)
  }

  for (const { starredAt } of starHistories) {
    const eachDayScore = new Decimal(1).times(
      calcAgingScore(dayjs(fixedLastCalculatedAt).diff(starredAt, 'day')),
    )
    result = result.plus(eachDayScore)
  }

  return result
}
