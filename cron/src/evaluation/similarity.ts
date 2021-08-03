import { Decimal } from 'decimal.js'
import { countBy } from 'rhodash'
import { Vector } from '../utils/math'

/**
 * 与えられた2つのコードの類似度を算出する
 * @param codeA ひとつめのコード
 * @param codeB ふたつめのコード
 * @returns {Float} 類似度
 */
export function calcCodeSimilarity(codeA: string, codeB: string): Decimal {
  const preprocessedCodeA = new Preprocessor(codeA).exec()
  const preprocessedCodeB = new Preprocessor(codeB).exec()

  const dividedA = divideByNgram(preprocessedCodeA)
  const dividedB = divideByNgram(preprocessedCodeB)

  return calcCosineSimilarityFromStringArrays(dividedA, dividedB)
}

const STOP_WORDS = [';', '\n', ' ', '\t'] // TODO: 空白も除去しているが、他の区切り方法にする場合は考える必要がある。

/**
 * 前処理を集めたクラス
 */
export class Preprocessor {
  constructor(private code: string) {}

  /**
   * 前処理を実行する
   * @returns 前処理後の文字列
   */
  exec(): string {
    this.removeStopWords()
    this.eliminateNotationFluctuation()
    return this.code
  }

  // ストップワードの除去
  private removeStopWords() {
    STOP_WORDS.forEach((stopWord) => {
      this.code = this.code.replace(new RegExp(stopWord, 'g'), '')
    })
  }

  // 表記ゆれをなくす
  private eliminateNotationFluctuation() {
    this.code = this.code.replace(/'/g, '"') // シングルクォートをダブルクォートに変換
  }
}

/**
 * 与えられた文字列をNグラムに分割する関数
 * @param str 分割する対象の文字列
 * @param N 1分割あたりの長さ
 * @returns 分割後の配列
 * @example divideByNgram('123', 2) // => ['12', '23']
 */
export function divideByNgram(str: string, N = 2): string[] {
  const result: string[] = []
  for (let i = 0; i <= str.length - N; i++) result.push(str.slice(i, i + N))
  return result
}

/**
 * 文字列の配列2つに対して、コサイン類似度を計算する
 * @param elementsA ['a', 'b']
 * @param elementsB ['a', 'c']
 * @private
 */
export function calcCosineSimilarityFromStringArrays(elementsA: string[], elementsB: string[]) {
  const allElementsSorted: string[] = [...new Set(elementsA.concat(elementsB))].sort() // すべての文字を格納する
  const vectorA: Vector = convertVectorFromStringArray(elementsA, allElementsSorted)
  const vectorB: Vector = convertVectorFromStringArray(elementsB, allElementsSorted)
  return vectorA.cosineSimilarity(vectorB)
}

/**
 * 出現回数に応じてベクトルに変換する
 * @param target 対象の配列 e.g. ['a', 'b', 'c']
 * @param candidates 出現文字列の候補。この順に出現回数をカウントする。 e.g. ['b', 'c', 'a', 'd']
 * @returns {Vector} ベクトル
 * @example convertVectorFromStringArray(['a', 'b', 'c'], ['b', 'c', 'a', 'd']) // => Vector([1, 1, 1, 0])
 * @private
 */
export function convertVectorFromStringArray(target: string[], candidates: string[]): Vector {
  return new Vector(candidates.map((candidate) => countBy(target, (t) => t === candidate)))
}
