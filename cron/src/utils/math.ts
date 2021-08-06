import { Decimal } from 'decimal.js'

/**
 * @param {Decimal} target 正規化をする対象
 * @param {Decimal} min その指標の最小値
 * @param {Decimal} max その指標の最大値
 * @returns 正規化された値
 */
export const normalize = ({ target, min, max }: { target: Decimal; min: Decimal; max: Decimal }) =>
  target.minus(min).dividedBy(max.minus(min))

/**
 * @param target 正規化をする対象
 * @param list targetを含む集合
 * @returns
 */
export const normalizeFromList = ({ target, list }: { target: Decimal; list: Decimal[] }) =>
  normalize({ target, min: Decimal.min(...list), max: Decimal.max(...list) })

/**
 * @param nums Decimal型の数値一覧
 * @returns
 */
export const sum = (nums: readonly Decimal[]) =>
  nums.reduce((acc, num) => acc.plus(num), new Decimal(0))

/**
 * コンビネーションのイテレーションを行うためのジェネレータ関数
 * @example
 * ```
 * for (const [a, b] of combinationIterator([1, 2, 3])) {
 *   console.log([a, b])
 * }
 * // => [1, 2], [1, 3], [2, 3]
 * ```
 */
export function* combinationIterator<T>(items: readonly T[]): Generator<T[], void, unknown> {
  const { length } = items
  for (let i = 0; i < length; i++) {
    for (let j = i + 1; j < length; j++) {
      yield [items[i], items[j]]
    }
  }
}

/**
 * ベクトルを表すクラス
 */
export class Vector {
  constructor(public elements: number[]) {}

  /**
   * ノルムを返す
   */
  get norm(): Decimal {
    return this.dot(this).sqrt()
  }

  /**
   * 内積を計算する
   * @param other もう一方のベクトル
   * @returns 内積
   */
  dot(other: Vector): Decimal {
    if (this.elements.length !== other.elements.length)
      throw Error('[Vector.prototype.multiply] different length')

    let result = new Decimal(0)
    const { length } = this.elements
    for (let i = 0; i < length; i++) {
      result = result.plus(new Decimal(this.elements[i]).times(other.elements[i]))
    }

    return result
  }

  /**
   * 2つのベクトルのコサイン類似度を計算する
   * @param other もう一方のベクトル
   * @returns コサイン類似度
   */
  cosineSimilarity(other: Vector): Decimal {
    return this.dot(other).dividedBy(this.norm.times(other.norm))
  }
}
