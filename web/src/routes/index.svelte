<script lang="ts">
  import type { FrameworkWithScore } from '@server/framework/framework.type'
  import type { Similarity } from '@server/type'
  import {
    DataTable,
    DataTableSkeleton,
    MultiSelect,
    Tag,
    TooltipIcon,
  } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/g10.css'
  import Information16 from 'carbon-icons-svelte/lib/Information16'
  import { baseFetch } from '~/utils/fetch'
  import { roundByTheDigits } from '~/utils/math'

  /** 類似度の比較を行う対象のフレームワークのidを格納した配列 */
  let similarityTargetIds: string[] = []
  /** 類似度の比較を行う対象のフレームワーク自体を格納した配列 */
  let similarityTargets: FrameworkWithScore[]
  $: similarityTargets = similarityTargetIds.flatMap(
    (idString) => frameworkWithScores.find((f) => f.id === Number(idString)) ?? [],
  )

  /** 「類似度の比較を行うフレームワーク」の選択が変更されたときの処理 */
  function onSelectSimilarityTarget() {
    // 動的にカラムが追加されると、ソートしたときの矢印がバグる。解決策として、loadingを一瞬表示することで、DOMを再生成する
    loading = true
    setTimeout(() => {
      loading = false
    })
  }

  /**
   * フレームワークから一意となるキーを生成する
   * keyにドットが混じっていると想定外の動作をするので、ドットは削除する
   * 例えば、 key: 'a.b'のとき、a: {b: <value> }を見に行ってしまう。
   **/
  const _getSimilarityKey = (framework: FrameworkWithScore) =>
    `${framework.name.replace(/\./g, '')}_similarity`
  $: evaluations = [
    {
      key: 'infoShareActivity',
      value: '情報共有の活発さ',
      weight: 0,
    },
    {
      key: 'developmentActivity',
      value: '開発の活発さ',
      weight: 0,
    },
    {
      key: 'maintenance',
      value: 'メンテナンス',
      weight: 0,
    },
    {
      key: 'popularity',
      value: '人気度',
      weight: 0,
    },
    {
      key: 'maturity',
      value: '成熟度',
      weight: 0,
    },
    ...similarityTargets.map((framework) => ({
      key: _getSimilarityKey(framework),
      value: `${framework.name}との類似度`,
      weight: 0,
    })),
  ]
  $: headers = [
    { key: 'name', value: 'フレームワーク' },
    ...evaluations,
    { key: 'weightedScore', value: '重み付けスコア' },
  ]

  /** ヘッダーに表示する各指標がわかりづらいので、ツールチップを表示する。その説明文 */
  const keyToTipText: Record<string, string> = {
    infoShareActivity: 'フレームワークに対する質問に対して、どれくらい回答が活発に行われているか',
    developmentActivity: 'コミットがどれだけ活発に行われているか',
    maintenance: 'メンテナンス(issueへの回答、バグの修正)が行われている度合い',
    popularity: 'ダウンロード数やスター数から算出した人気',
    maturity: '破壊的変更が起きる確率の低さ',
  }

  let loading = true
  let frameworkWithScores: FrameworkWithScore[] = []
  let frameworkSimularities: Similarity[] = []
  ;(async () => {
    const [
      { data: _frameworkWithScores, error: frameworkWithScoresError },
      { data: _similarities, error: similaritiesError },
    ] = await Promise.all([
      baseFetch<void, FrameworkWithScore[]>('frameworks/scores'),
      baseFetch<void, Similarity[]>('frameworks/similarities'),
    ])
    if (frameworkWithScoresError != null) return alert('failed to fetch scores')
    if (similaritiesError != null) return alert('failed to fetch similarities')

    frameworkWithScores = _frameworkWithScores ?? []
    frameworkSimularities = _similarities ?? []
    loading = false
  })()

  /**
   * サーバーから取得した類似度一覧に対して、検索をかける
   * @param targetId 基準となるフレームワークの id
   * @param comparisonId 比較対象となるフレームワークの id
   * @returns {float} 2つの類似度
   */
  function _getSimilarityBetween(targetId: number, comparisonId: number): number {
    if (targetId === comparisonId) return 1
    return (
      frameworkSimularities.find(
        (sim) =>
          (sim.targetId === targetId && sim.comparisonId === comparisonId) ||
          (sim.targetId === comparisonId && sim.comparisonId === targetId), // target と comparison をひっくり返したパターンも考えられる
      )?.cosineSimilarity ?? 0
    )
  }

  /* テーブルに表示するデータ */
  $: rows = frameworkWithScores.map((eachFramework) => {
    const row: { id: number } & Record<string, string | number> = {
      id: eachFramework.id,
      name: eachFramework.name,
      officialURL: eachFramework.officialURL ?? '',
      // 開発の活発さ、メンテンナンスなどのセル
      ...Object.fromEntries(
        Object.entries(eachFramework.score ?? {}).map(([key, val]) => [
          key,
          roundByTheDigits(val, settings.digits),
        ]),
      ),
      // 類似度に関するセル
      ...Object.fromEntries(
        similarityTargets.map((similarityTarget) => [
          _getSimilarityKey(similarityTarget),
          roundByTheDigits(
            _getSimilarityBetween(eachFramework.id, similarityTarget.id),
            settings.digits,
          ),
        ]),
      ),
    }

    // 重み付けスコアのセル
    const weightedScore: number = evaluations.reduce((sum, evaluation) => {
      const thisEvaluationValue = row[evaluation.key]
      return (
        sum +
        (typeof thisEvaluationValue === 'number' ? thisEvaluationValue : 0) * evaluation.weight
      )
    }, 0)
    return { ...row, weightedScore: roundByTheDigits(weightedScore, settings.digits) }
  })

  /** 重みのバリデーションを行い、有効であれば反映する */
  function handleWeightInputChange(e: { currentTarget: HTMLInputElement }) {
    // 重みの入力欄が`<input name={<key>} class="weight-input" />`と設置されている前提
    const weightInputElems: HTMLInputElement[] = Array.from(
      document.querySelectorAll<HTMLInputElement>('.weight-input'),
    )
    if (!_validateWeights(weightInputElems.map((elem) => elem.valueAsNumber))) {
      e.currentTarget.setCustomValidity('重みは0~1の値を入力してください')
      e.currentTarget.reportValidity()
      return
    }

    e.currentTarget.setCustomValidity('')
    evaluations = evaluations.map((ev) => {
      if (ev.key === e.currentTarget.name) {
        ev.weight = e.currentTarget.valueAsNumber
      }
      return ev
    })
  }

  function _validateWeights(weights: number[]): boolean {
    // 重みの絶対値が1を超えるものをはじく
    if (weights.some((w) => Math.abs(w) > 1)) return false
    // 重みの合計に関するバリデーション
    // if (newEvaluations.reduce((sum, current) => sum + current.weight, 0) < 1) return false
    return true
  }

  let settings = {
    digits: 3, // 表示する少数の桁数
  }

  const presetHandler = {
    beginner() {
      _assginWeightInputElement({
        infoShareActivity: 1,
        developmentActivity: 0,
        maintenance: 0.5,
        popularity: 0.1,
        maturity: 0.2,
      })
    },
    stabilityOriented() {
      _assginWeightInputElement({
        infoShareActivity: 0.5,
        developmentActivity: 0,
        maintenance: 0.8,
        popularity: 0.1,
        maturity: 1,
      })
    },
    developmentActivityOriented() {
      _assginWeightInputElement({
        infoShareActivity: 0.2,
        developmentActivity: 1,
        maintenance: 0.8,
        popularity: 0.1,
        maturity: 0.1,
      })
    },
  }

  function _assginWeightInputElement(
    preset: {
      [K in
        | 'infoShareActivity'
        | 'developmentActivity'
        | 'maintenance'
        | 'popularity'
        | 'maturity']: number
    },
  ) {
    // input要素に無理やり代入する
    for (const [key, value] of Object.entries(preset)) {
      const elem = document.querySelector<HTMLInputElement>(`input.weight-input[name="${key}"]`)
      if (elem == null) continue

      elem.value = value.toString()
      evaluations = evaluations.map((ev) => (ev.key === key ? { ...ev, weight: value } : ev))
    }
  }
</script>

<div class="container">
  {#if loading}
    <DataTableSkeleton rows={rows.length || 5} showHeader={false} showToolbar={false} />
  {:else}
    <DataTable stickyHeader sortable {headers} {rows}>
      <div slot="cell-header" let:header>
        {#if keyToTipText[header.key]}
          <span class="v-center">
            {header.value}
            <TooltipIcon tooltipText={keyToTipText[header.key]} icon={Information16} />
          </span>
        {:else}
          {header.value}
        {/if}
      </div>
      <div slot="cell" let:row let:cell>
        {#if cell.key === 'name'}
          <a href={row.officialURL} target="_blank">{cell.value}</a>
        {:else}
          {cell.value}
        {/if}
      </div>
    </DataTable>
  {/if}

  <div class="weight-inputs-wrapper" style="--col-length: {headers.length}">
    <span class="weight-label">
      重み(それぞれ0 ~ 1)
      <TooltipIcon
        tooltipText="各指標をどれだけ重要視するか入力してください"
        icon={Information16}
      />
    </span>
    {#each evaluations as evaluation}
      <div class="each-weight-input-wrapper">
        <input
          type="number"
          step="0.01"
          on:change={handleWeightInputChange}
          name={evaluation.key}
          class="weight-input"
        />
      </div>
    {/each}
  </div>

  <h2>
    類似度の比較を行うフレームワーク
    <TooltipIcon icon={Information16}>
      <div slot="tooltipText" style="display: block;">
        <div style="display: flex;">
          <span style="display: inline-block; width: 2rem;">例1)</span>
          <span style="display: inline-block; flex: 1">
            すでに習得済みのフレームワークを選択することで、追加の学習コストが低いフレームワークを探すことができます。
          </span>
        </div>
        <div style="display: flex;">
          <span style="display: inline-block; width: 2rem;">例2)</span>
          <span style="display: inline-block; flex: 1">
            すでに導入済みのフレームワークを選択することで、移行コストの低いフレームワークを探すことができます。
          </span>
        </div>
      </div>
    </TooltipIcon>
  </h2>
  <MultiSelect
    spellcheck="false"
    filterable
    placeholder="フレームワークを検索..."
    bind:selectedIds={similarityTargetIds}
    on:select={onSelectSimilarityTarget}
    items={frameworkWithScores.map((framework) => ({
      id: String(framework.id),
      text: framework.name,
    }))}
  />
  {#each similarityTargets as similarityTarget}
    <Tag>{similarityTarget.name}</Tag>
  {/each}

  <h2>重みのプリセット</h2>
  <ul class="preset-wrapper">
    <li><button on:click={presetHandler.beginner}>初心者向け</button></li>
    <li><button on:click={presetHandler.stabilityOriented}>安定性重視</button></li>
    <li><button on:click={presetHandler.developmentActivityOriented}>開発の活発さ重視</button></li>
  </ul>

  <h2>設定</h2>
  <label>
    表示桁数
    <input type="number" bind:value={settings.digits} />
  </label>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: auto;
    padding-top: 4rem;
  }
  h2 {
    margin-top: 2rem;
  }

  .preset-wrapper {
    display: flex;
  }
  .preset-wrapper > li + li {
    margin-left: 1rem;
  }

  .preset-wrapper button {
    cursor: pointer;
  }

  input:invalid {
    border: solid red 2px;
  }

  .weight-inputs-wrapper {
    --each-width: calc(100% / var(--col-length));
  }
  .each-weight-input-wrapper {
    display: inline-block;
    padding: 0.5rem 1rem;
    width: var(--each-width);
  }
  .each-weight-input-wrapper input {
    width: 100%;
  }
  .weight-label {
    display: inline-flex;
    width: var(--each-width);
    text-align: center;
    justify-content: center;
    align-items: center;
  }

  /* util */
  .v-center {
    /* 垂直方向の中心揃え */
    display: flex;
    align-items: center;
  }

  /* override */
  .container :global(.bx--table-header-label),
  .container :global(thead) {
    /* ヘッダーに配置されているツールチップが見切れないように */
    overflow: visible;
  }
</style>
