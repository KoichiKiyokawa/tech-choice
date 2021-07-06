import Decimal from 'decimal.js'
import { normalize, normalizeFromList, sum } from '../../src/utils/math'

describe('普通の正規化', () => {
  it('targetが20, 最小値が0で最大値が100のとき、0.2を返す', () => {
    const result = normalize({
      target: new Decimal(20),
      min: new Decimal(0),
      max: new Decimal(100),
    })

    expect(result.equals(new Decimal(0.2))).toBe(true)
  })
})

describe('配列から求める正規化', () => {
  it('0, 2, 10の集合で、2に対して正規化を行うと0.2になる', () => {
    const decimalNumbers: Decimal[] = [0, 2, 10].map((n) => new Decimal(n))
    const result = normalizeFromList({ target: new Decimal(2), list: decimalNumbers })
    expect(result.equals(new Decimal(0.2))).toBe(true)
  })
})

describe('数字配列の総和', () => {
  it('1, 2, 3', () => {
    const nums = [1, 2, 3].map((n) => new Decimal(n))
    expect(sum(nums).equals(new Decimal(6))).toBe(true)
  })
})
