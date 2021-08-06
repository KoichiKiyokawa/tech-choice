<script lang="ts">
  import type { FrameworkWithScore } from '@server/framework/framework.type'
  import type { Score } from '@server/type'
  import { DataTable } from 'carbon-components-svelte'
  import 'carbon-components-svelte/css/g10.css'
  import { baseFetch } from '~/utils/fetch'
  import { roundByTheDigits } from '~/utils/math'

  let evaluations: {
    key: keyof Pick<Score, 'developmentActivity' | 'maintenance' | 'popularity'>
    value: string
    weight: number
  }[] = [
    { key: 'developmentActivity', value: '開発の活発さ', weight: 0 },
    { key: 'maintenance', value: 'メンテナンス', weight: 0 },
    { key: 'popularity', value: '人気度', weight: 0 },
  ]
  const headers = [
    { key: 'name', value: 'フレームワーク' },
    ...evaluations,
    { key: 'weightedScore', value: '重み付けスコア' },
  ]

  // 重みの入力欄の数値を格納しておく
  let weightInputs: Record<typeof evaluations[number]['key'], number> = {
    developmentActivity: 0,
    maintenance: 0,
    popularity: 0,
  }

  let frameworkWithScores: FrameworkWithScore[] = []

  ;(async () => {
    const { data, error } = await baseFetch<void, FrameworkWithScore[]>('frameworks/scores')
    if (error != null) return alert('failed to fetch data')

    frameworkWithScores = data ?? []
  })()

  $: rows = frameworkWithScores.map((fws) => ({
    ...fws,
    ...Object.fromEntries(
      Object.entries(fws.score ?? {}).map(([key, val]) => [
        key,
        roundByTheDigits(val, settings.digits),
      ]),
    ),
    weightedScore: evaluations.reduce(
      (sum, evaluation) => sum + (fws.score?.[evaluation.key] ?? 0) * evaluation.weight,
      0,
    ),
  }))

  /**
   * 重みのバリデーションを行い、有効であれば反映する。
   */
  function handleWeightInputChange(e: { currentTarget: HTMLInputElement }) {
    if (!_validateWeights(Object.values(weightInputs))) {
      e.currentTarget.setCustomValidity('invalid weight')
      e.currentTarget.reportValidity()
      return
    }

    e.currentTarget.setCustomValidity('')
    evaluations = evaluations.map((ev) => ({ ...ev, weight: weightInputs[ev.key] }))
  }

  function _validateWeights(weights: number[]): boolean {
    // 重みの絶対値が1を超えるものをはじく
    if (weights.some((w) => Math.abs(w) > 1)) return false
    // if (newEvaluations.reduce((sum, current) => sum + current.weight, 0) < 1) return false
    return true
  }

  let settings = {
    digits: 3, // 表示する少数の桁数
  }
</script>

<div class="container">
  <DataTable stickyHeader sortable {headers} {rows} />

  <div class="weight-inputs-wrapper" style="--col-length: {headers.length}">
    <span class="weight-label">重み</span>
    {#each evaluations as evaluation}
      <div class="each-weight-input-wrapper">
        <input
          type="number"
          step="0.01"
          bind:value={weightInputs[evaluation.key]}
          on:change={handleWeightInputChange}
        />
      </div>
    {/each}
  </div>

  <h2>プリセット</h2>
  <p>TODO</p>

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
    padding-top: 2rem;
  }
  h2 {
    margin-top: 1rem;
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
    display: inline-block;
    width: var(--each-width);
    text-align: center;
  }
</style>
