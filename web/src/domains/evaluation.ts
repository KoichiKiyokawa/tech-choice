import type { Score } from '@server/type'

/** はじめから表示する指標のキー */
export type DefaultEvaluationKey = keyof Omit<Score, 'id' | 'frameworkId'>

/**
 * キーにドットがあると，DataTableが想定外の動作をするため，ドットは弾く必要があることに注意されたい．
 * @see {getSimilarityKeyByFrameworkName}
 */
type FrameworkSimilarityKey = `${string}_similarity`

/** はじめから表示する指標 + 類似度の比較対象となるフレームワーク */
export type EvaluationKey = DefaultEvaluationKey | FrameworkSimilarityKey

/**
 * フレームワークから一意となるキーを生成する
 * keyにドットが混じっているとDataTableが想定外の動作をするので、ドットは削除する
 * 例えば、 key: 'a.b'のとき、a: {b: <value> }を見に行ってしまう。
 **/
export const getSimilarityKeyByFrameworkName = (frameworkName: string): FrameworkSimilarityKey =>
  `${frameworkName.replace(/\./g, '')}_similarity`

/** ヘッダーに表示する各指標がわかりづらいので、ツールチップを表示する。その説明文 */
export const EVALUATION_TEXTS: Record<DefaultEvaluationKey, { text: string; tip: string }> = {
  infoShareActivity: {
    text: 'Info share activity',
    tip: 'フレームワークに関する質問やそれに対する回答がどれだけ活発に行われているか',
  },
  developmentActivity: {
    text: 'Development activity',
    tip: '新機能の追加やドキュメントの更新がどれだけ活発に行われているか',
  },
  maintenance: {
    text: 'Maintenance',
    tip: 'メンテナンス(issueへの回答、バグの修正)が行われている度合い',
  },
  popularity: {
    text: 'Popularity',
    tip: 'どれだけ注目されているか',
  },
  maturity: { text: 'Maturity', tip: 'The degree of stability with few destructive changes' },
}
