import { MarkdownTable } from '../../src/utils/table'

describe('ふつうのテーブル', () => {
  it('ヘッダーがa, bのテーブル', () => {
    const table = new MarkdownTable('table', ['a', 'b'])
    table.addRow({ a: 1, b: 2 })

    expect(`${table}`).toBe(`# table

a|b
---|---
1|2`)
  })
})
