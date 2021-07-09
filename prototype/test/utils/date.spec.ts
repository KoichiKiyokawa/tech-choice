import { calcAgingScore } from '../../src/utils/date'

describe('経過日数に応じて価値を下げる、calcAgingScoreメソッドが正しく計算されるか', () => {
  it('経過日数が0であれば、係数は1と等しくなる', () => {
    expect(calcAgingScore(0).toString()).toBe('1')
  })

  it('経過日数が30日であれば、係数は1/2になる', () => {
    expect(calcAgingScore(30).toString()).toBe('0.5')
  })
})
