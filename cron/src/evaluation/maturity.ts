import { Decimal } from 'decimal.js'
import dayjs from 'dayjs'
import { DateISOstring } from '../types/date'
import { calcAgingScore } from '../utils/date'

export function calcMaturityForSpecificFramework({
  stableVersionHistory,
}: {
  stableVersionHistory: DateISOstring[]
}): Decimal {
  const lastPublishedAt = stableVersionHistory.sort().slice(-1)[0]

  return stableVersionHistory.reduce((result, date) => {
    // 古い公開日ほど重みを強くする。なぜなら、公開日が古いほうが成熟していると言えるから。
    // ただし、10年前にv0.0.1が公開されて以降、何も公開されていないフレームワークは点数を高くしたくない。
    // 最新バージョンとの日数の差 = そのバージョンがどれだけ成熟に寄与したか
    // そのため、最新バージョンとの日数の差が大きいほど点数を高くする。
    const ageCoef = new Decimal(1).dividedBy(
      calcAgingScore(dayjs(lastPublishedAt).diff(date, 'day')),
    ) // agingScore(新しいほど価値が高い)の逆数をとる
    return result.plus(ageCoef)
  }, new Decimal(0))
}
