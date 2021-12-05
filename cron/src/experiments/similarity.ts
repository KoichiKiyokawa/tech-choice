import { calcCodeSimilarity } from '../evaluation/similarity'

const codeA = 'let count = 0;'
const codeB = `data: (() => {
  count: 0
})`

console.log(calcCodeSimilarity(codeA, codeB))
