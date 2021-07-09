import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { AGING_COEF } from '../constants/coef'

/**
 * 現在時刻から1年以内かを判定する。1年より1秒でも短ければ true を返す
 */
export const withinOneYear = (dateStr: string) => dayjs().diff(dateStr, 'year') < 1

/**
 * AGING_COEF / (AGING_COEF + 経過日数)をすることによって、経過日数が少ないものほど価値が高くなるようにする
 * @param elapsedDays
 * @returns 経過日数に応じて価値を下げた値
 */
export const calcAgingScore = (elapsedDays: number): Decimal =>
  new Decimal(AGING_COEF).dividedBy(AGING_COEF + elapsedDays)
