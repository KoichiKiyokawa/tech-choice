<script lang="ts">
  import type { FrameworkWithScore } from '@server/framework/framework.type'
  import type { Score } from '@server/type'
  import { DataTable } from 'carbon-components-svelte'
  import { baseFetch } from '~/utils/fetch'

  let evaluations: {
    key: keyof Score
    value: string
    weight: number
  }[] = [
    { key: 'developmentActivity', value: '開発の活発さ', weight: 0 },
    { key: 'maintenance', value: 'メンテナンス', weight: 0 },
    { key: 'popularity', value: '人気度', weight: 0 },
  ]
  const evaluationKeys: string[] = evaluations.map((e) => e.key) // cell.key が string 型なのでダウンキャストしておく
  const headers = [
    { key: 'name', value: 'フレームワーク' },
    ...evaluations,
    { key: 'weightedScore', value: '重み付けスコア' },
  ]

  let frameworkWithScores: FrameworkWithScore[] = []

  let digits = 3 // 表示する少数の桁数
  ;(async () => {
    const { data, error } = await baseFetch<void, FrameworkWithScore[]>('frameworks/scores')
    if (error != null) return alert('failed to fetch data')

    frameworkWithScores = data ?? []
  })()

  $: rows = frameworkWithScores.map((fws) => ({
    ...fws,
    ...fws.score,
    weightedScore: evaluations.reduce(
      (sum, evaluation) => sum + (fws.score?.[evaluation.key] ?? 0) * evaluation.weight,
      0,
    ),
  }))

  const shouldPutInputHereSymbol = Symbol('shouldPutInputHere')

  function handleInputWeight(e: { currentTarget: HTMLInputElement }) {
    const targetEvaluationKey = e.currentTarget.name as keyof Score
    const newEvaluations = evaluations.map((ev) =>
      ev.key === targetEvaluationKey ? { ...ev, weight: Number(e.currentTarget.value) } : ev,
    )
    const ok = validateWeights(newEvaluations)
    if (!ok) {
      e.currentTarget.setCustomValidity('invalid weight')
      e.currentTarget.reportValidity()
      return
    }

    e.currentTarget.setCustomValidity('')
    evaluations = newEvaluations
  }

  function validateWeights(newEvaluations: { weight: number }[]): boolean {
    // 重みの絶対値が1を超えるものをはじく
    if (newEvaluations.some((ev) => Math.abs(ev.weight) > 1)) return false
    // if (newEvaluations.reduce((sum, current) => sum + current.weight, 0) < 1) return false
    return true
  }
</script>

<DataTable
  sortable
  {headers}
  rows={[
    ...rows,
    {
      id: 'footer',
      key: 'footer',
      name: '',
      weightedScore: '',
      ...Object.fromEntries(evaluationKeys.map((key) => [key, shouldPutInputHereSymbol])),
    },
  ]}
  class="hoge"
>
  <span slot="cell" let:row let:cell>
    {#if row.id === 'footer' && cell.value === shouldPutInputHereSymbol}
      <input
        value={evaluations.find((ev) => ev.key === cell.key)?.weight ?? 0}
        on:change={handleInputWeight}
        name={cell.key}
      />
    {:else if evaluationKeys.includes(cell.key)}
      <!-- 少数を丸めて表示する -->
      {Math.round(cell.value * 10 ** digits) / 10 ** digits}
    {:else}
      {cell.value}
    {/if}
  </span>
</DataTable>

<style>
  input:invalid {
    border: solid red 2px;
  }
</style>
