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
  import {
    EvaluationKey,
    EVALUATION_TEXTS,
    getSimilarityKeyByFrameworkName,
  } from '~/domains/evaluation'
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

  /** 現在適用中の重みを保存する */
  let evaluations: { [K in EvaluationKey]?: number } = {
    infoShareActivity: 0,
    developmentActivity: 0,
    maintenance: 0,
    maturity: 0,
    popularity: 0,
  }

  /** 入力中の重みを保持する */
  let weightForm: typeof evaluations = {}

  /** 表のヘッダー */
  let headers: { key: 'name' | EvaluationKey | 'weightedScore'; value: string }[]
  $: headers = [
    { key: 'name', value: 'Framework' },
    // デフォルトで表示する指標たち
    ...Object.entries(EVALUATION_TEXTS).map(([key, info]) => ({
      key: key as EvaluationKey,
      value: info.text,
    })),
    // 類似度に関する指標たち
    ...similarityTargets.map((target) => ({
      key: getSimilarityKeyByFrameworkName(target.name),
      value: `Similarity to ${target.name}`,
    })),
    { key: 'weightedScore', value: 'Weighted score' },
  ]

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
          getSimilarityKeyByFrameworkName(similarityTarget.name),
          roundByTheDigits(
            _getSimilarityBetween(eachFramework.id, similarityTarget.id),
            settings.digits,
          ),
        ]),
      ),
    }

    // 重み付けスコアのセル
    const weightedScore: number = Object.entries(evaluations).reduce(
      (sum, [evaluationKey, evaluationWeight]) => {
        const thisEvaluationValue = row[evaluationKey]
        if (typeof thisEvaluationValue === 'string') return sum

        return sum + (thisEvaluationValue ?? 0) * (evaluationWeight ?? 0)
      },
      0,
    )
    return { ...row, weightedScore: roundByTheDigits(weightedScore, settings.digits) }
  })

  /** 重みのバリデーションを行い、有効であれば反映する */
  function handleWeightInputChange(e: { currentTarget: HTMLInputElement }) {
    const inputingValue = e.currentTarget.valueAsNumber
    if (inputingValue < 0 || inputingValue > 1) {
      e.currentTarget.setCustomValidity('重みは0~1の値を入力してください')
      e.currentTarget.reportValidity()
      return
    }

    e.currentTarget.setCustomValidity('')
    evaluations = { ...weightForm }
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

  function _assginWeightInputElement(preset: { [K in EvaluationKey]?: number }) {
    weightForm = { ...preset }
    evaluations = { ...weightForm }
  }

  /** { [key: 指標のキー]: その指標のツールチップに表示する説明 } */
  $: keyToTipText = Object.fromEntries(
    Object.entries(EVALUATION_TEXTS).map(([key, info]) => [key, info.tip]),
  )
  /**
   * ヘッダーの左から表示されている順に指標のキーを並べた配列．
   * ヘッダーの最初には「フレームワーク」最後には「重み付けスコア」が配置されている前提．これらは指標とは関係ないので除外する
   */
  $: evaluationsKeys = headers.slice(1, -1).map((header) => header.key) as EvaluationKey[]
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
      <div>
        weight<span style="display: inline-block;">(0 ~ 1 for each)</span>
      </div>
      <TooltipIcon
        tooltipText="各指標をどれだけ重要視するかを0~1の範囲で入力してください"
        icon={Information16}
      />
    </span>
    {#each evaluationsKeys as evaluationKey}
      <div class="each-weight-input-wrapper">
        <input
          type="number"
          step="0.01"
          on:change={handleWeightInputChange}
          bind:value={weightForm[evaluationKey]}
          name={evaluationKey}
        />
      </div>
    {/each}
  </div>

  <h2>
    Frameworks to be compared for similarity
    <TooltipIcon icon={Information16}>
      <div slot="tooltipText" style="display: block;">
        <p>APIの類似度を比較します</p>
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
    placeholder="Search frameworks..."
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

  <h2>Weight presets</h2>
  <ul class="preset-wrapper">
    <li><button on:click={presetHandler.beginner}>For beginners</button></li>
    <li><button on:click={presetHandler.stabilityOriented}>Stability oriented</button></li>
    <li>
      <button on:click={presetHandler.developmentActivityOriented}
        >Speed of evolution oriented</button
      >
    </li>
  </ul>

  <h2>Settings</h2>
  <label>
    Number of display digits
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

  .container :global(.bx--table-header-label) {
    font-size: 0.8rem;
  }
</style>
