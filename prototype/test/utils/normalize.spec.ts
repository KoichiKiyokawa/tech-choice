import Decimal from 'decimal.js'
import { normalize } from '../../src/utils/normalize'

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
