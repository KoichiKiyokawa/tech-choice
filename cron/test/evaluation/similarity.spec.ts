import {
  calcCodeSimilarity,
  convertVectorFromStringArray,
  divideByNgram,
  Preprocessor,
} from '../../src/evaluation/similarity'

describe('preprocess', () => {
  it('remove stop words and eliminate notation fluctuation', () => {
    const code = `import{ hoge } from 'bar'; console.log(';;');`
    expect(new Preprocessor(code).exec()).toBe(`import{hoge}from"bar"console.log("")`)
  })
})

describe('divide by N gram', () => {
  it('N = 2 for array of even length', () => {
    expect(divideByNgram('123456')).toEqual(['12', '23', '34', '45', '56'])
  })
  it('N = 2 for array of odd length', () => {
    expect(divideByNgram('1234567')).toEqual(['12', '23', '34', '45', '56', '67'])
  })
})

describe('convert to vector', () => {
  it("convert ['a', 'b', 'c'] by ['b', 'c', 'a', 'd']", () => {
    expect(convertVectorFromStringArray(['a', 'b', 'c'], ['b', 'c', 'a', 'd']).elements).toEqual([
      1, 1, 1, 0,
    ])
  })

  it("convert ['a', 'b', 'b', 'c'] by ['b', 'c', 'a', 'd']", () => {
    expect(
      convertVectorFromStringArray(['a', 'b', 'b', 'c'], ['b', 'c', 'a', 'd']).elements,
    ).toEqual([2, 1, 1, 0])
  })
})

describe('cosine similarity', () => {
  const codeA = 'import { A } from "foo"'
  const codeB = 'import { B } from "bar"'
  expect(calcCodeSimilarity(codeA, codeB).toNumber()).toBe(0.7857142857142857)
})
