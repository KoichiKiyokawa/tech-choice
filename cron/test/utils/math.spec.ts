import Decimal from 'decimal.js'
import {
  combinationIterator,
  normalize,
  normalizeFromList,
  normalizeFromMap,
  standardizeFromList,
  standardizeFromMap,
  sum,
  Vector,
} from '../../src/utils/math'

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

  it('空の配列にたいして正規化を行うと、エラーが返る', () => {
    expect(() => {
      normalizeFromList({ target: new Decimal(0), list: [] })
    }).toThrow('Invalid argument: undefined')
  })
})

describe('マップから求める正規化', () => {
  it('0, 2, 10のマップで2に対して正規化を行うと0.2になる', () => {
    const map = new Map([
      ['a', new Decimal(0)],
      ['b', new Decimal(2)],
      ['c', new Decimal(10)],
    ])
    expect(normalizeFromMap({ targetKey: 'b', map }).toNumber()).toBeCloseTo(0.2)
  })
})

describe('配列から求める標準化', () => {
  it('10, 20, 30の集合で、30に対して標準化を行うと1.224744871391589くらいになる', () => {
    expect(
      standardizeFromList({
        target: new Decimal(30),
        list: [10, 20, 30].map((n) => new Decimal(n)),
      }).toNumber(),
    ).toBeCloseTo(1.224744871391589)
  })

  it('10, 20, 30の集合で、20に対して標準化を行うと0になる', () => {
    expect(
      standardizeFromList({
        target: new Decimal(20),
        list: [10, 20, 30].map((n) => new Decimal(n)),
      }).toNumber(),
    ).toEqual(0)
  })
})

describe('マップから求める標準化', () => {
  const map = new Map<'a' | 'b' | 'c', Decimal>([
    ['a', new Decimal(10)],
    ['b', new Decimal(20)],
    ['c', new Decimal(30)],
  ])
  it('10, 20, 30の集合で、30に対して標準化を行うと1.224744871391589くらいになる', () => {
    expect(standardizeFromMap({ targetKey: 'c', map }).toNumber()).toBeCloseTo(1.224744871391589)
  })

  it('10, 20, 30の集合で、20に対して標準化を行うと0になる', () => {
    expect(standardizeFromMap({ targetKey: 'b', map }).toNumber()).toEqual(0)
  })
})

describe('数字配列の総和', () => {
  it('1, 2, 3', () => {
    const nums = [1, 2, 3].map((n) => new Decimal(n))
    expect(sum(nums).equals(new Decimal(6))).toBe(true)
  })

  it('0.1, 0.2, 0.3', () => {
    const nums = [0.1, 0.2, 0.3].map((n) => new Decimal(n))
    expect(sum(nums).equals(new Decimal(0.6))).toBe(true)
  })
})

describe('コンビネーション', () => {
  it('combination for [1, 2, 3]', () => {
    expect([...combinationIterator([1, 2, 3])]).toEqual([
      [1, 2],
      [1, 3],
      [2, 3],
    ])
  })
})
describe('ベクトル', () => {
  const vecA = new Vector([1, 2, 3])
  const vecB = new Vector([4, 5, 6])

  it('ベクトルの長さ', () => {
    expect(new Vector([3, 4]).norm.toNumber()).toBe(5)
  })

  it('ベクトルの内積', () => {
    expect(vecA.dot(vecB).toNumber()).toBe(1 * 4 + 2 * 5 + 3 * 6)
  })
})
