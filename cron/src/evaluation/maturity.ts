import { Decimal } from 'decimal.js'
import dayjs from 'dayjs'
import { DateISOstring } from '../types/date'
import { calcAgingScore } from '../utils/date'

export function calcMaturityForSpecificFramework({
  stableVersionHistory,
}: {
  stableVersionHistory: DateISOstring[]
}): Decimal {
  return stableVersionHistory.reduce((result, date) => {
    // 古い公開日ほど重みを強くする。なぜなら、公開日が古いほうが成熟していると言えるから。
    const ageCoef = new Decimal(1).dividedBy(calcAgingScore(dayjs().diff(date, 'day'))) // agingScore(新しいほど価値が高い)の逆数をとる
    return result.plus(ageCoef)
  }, new Decimal(0))
}
