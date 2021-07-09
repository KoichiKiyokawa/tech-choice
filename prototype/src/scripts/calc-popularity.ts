import Decimal from 'decimal.js'
import { normalizeFromList, sum } from '../utils/math'
import { fetchDownloads } from '../fetcher/fetch-downloads'
import { Frameworks, FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { MarkdownTable } from '../utils/table'
import { saveResultToFile } from '../utils/file'
import { calcAgingScore } from '../utils/date'

/**
 * ダウンロード数やスター数などから popularity を測る
 */
async function main() {
  const nameWithResults: Map<Frameworks, Decimal> = new Map()
  for (const { name } of FRAMEWORK_WITH_OWNER_LIST) {
    nameWithResults.set(name, await calcDownloadScore(name))
  }

  const table = new MarkdownTable('download score', ['name', 'score', 'normalizedScore'])
  const scores: Decimal[] = Array.from(nameWithResults.values())
  for (const { name } of FRAMEWORK_WITH_OWNER_LIST) {
    const theFrameWorkScore = nameWithResults.get(name)!
    table.addRow({
      name,
      score: theFrameWorkScore.toFixed(2),
      normalizedScore: normalizeFromList({
        target: theFrameWorkScore,
        list: scores,
      }).toFixed(2),
    })
  }
  saveResultToFile(table.toString(), 'calc-popularity')
}

async function calcDownloadScore(name: string): Promise<Decimal> {
  const [daily, weekly, monthly, quarterly, halfYearly, yearly] = await fetchDownloads(name)

  const sumOfScore = sum([
    new Decimal(yearly.count - halfYearly.count).times(calcAverageAging(12 * 30, 6 * 30)),
    new Decimal(halfYearly.count - quarterly.count).times(calcAverageAging(6 * 30, 3 * 30)),
    new Decimal(quarterly.count - monthly.count).times(calcAverageAging(3 * 30, 1 * 30)),
    new Decimal(monthly.count - weekly.count).times(calcAverageAging(30, 7)),
    new Decimal(weekly.count - daily.count).times(calcAverageAging(7, 0)),
  ])

  return sumOfScore
}

/**
 * AgingScore: 30 / (経過日数 + 30)のようなもの。経過日数が増えるほど小さくなり、価値が低くなる。
 * 例えば、12ヶ月から6ヶ月の期間中のAgingScoreはその期間中の平均とする。一ヶ月は30日として計算する。
 * @example calcAverageAging(12 * 30, 6 * 30)
 * @private
 */
export function calcAverageAging(fromDaysAgo: number, toDajsAgo: number): Decimal {
  const [from, to] = fromDaysAgo < toDajsAgo ? [fromDaysAgo, toDajsAgo] : [toDajsAgo, fromDaysAgo]

  let result = new Decimal(0)
  for (let day = from; day <= to; day++) {
    result = result.plus(calcAgingScore(day))
  }
  return result.dividedBy(to - from + 1)
}

/**
 * calcAverageAging(12 * 30, 6 * 30) -> 0.10321053378313026992
 * calcAverageAging(6 * 30, 3 * 30) -> 0.18664856187014189589
 * calcAverageAging(3 * 30, 1 * 30) -> 0.34704813495163463716
 * calcAverageAging(1 * 30, 7) -> 0.63163902019637338667
 * calcAverageAging(7, 0) -> 0.89974659837978149173
 */

main()
