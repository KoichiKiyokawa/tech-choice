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
    tip: 'The extent to which the questions and answers about the framework are being asked and answered.',
  },
  developmentActivity: {
    text: 'Development activity',
    tip: 'The degree to which new features are added and bugs are fixed.',
  },
  maintenance: {
    text: 'Maintenance',
    tip: 'The extent to which bug reports and specification questions are resolved.',
  },
  popularity: {
    text: 'Popularity',
    tip: 'How much attention is paid by front-end developers.',
  },
  maturity: { text: 'Maturity', tip: 'The degree of stability with few destructive changes.' },
}
