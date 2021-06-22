import { Decimal } from 'decimal.js'

/**
 * @param {Decimal} target 正規化をする対象
 * @param {Decimal} min その指標の最小値
 * @param {Decimal} max その指標の最大値
 * @returns 正規化された値
 */
export const normalize = ({ target, min, max }: { target: Decimal; min: Decimal; max: Decimal }) =>
  target.minus(min).dividedBy(max.minus(min))
