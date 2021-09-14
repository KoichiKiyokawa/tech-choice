import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { fixedLastCalculatedAt } from '../../constants/date'
import { FRAMEWORK_WITH_OWNER_LIST } from '../../constants/framework-list'
import { fetchStarredAtList, StarHistory } from '../../fetcher/fetch-starred-at-list'
import { calcAgingScore } from '../../utils/date'
import { saveResultToFile } from '../../utils/file'
import { normalizeFromList } from '../../utils/math'
import { MarkdownTable } from '../../utils/table'

async function main() {
  const allFrameworkResults: StarHistory[][] = await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map(fetchStarredAtList),
  )

  const allFrameworkScores: Decimal[] = allFrameworkResults.map((starHistories) =>
    starHistories.reduce(
      (acc, history) =>
        acc.plus(calcAgingScore(dayjs(fixedLastCalculatedAt).diff(history.starredAt, 'days'))),
      new Decimal(0),
    ),
  )

  const table = new MarkdownTable('star popularity score', ['name', 'score', 'normalized'])
  allFrameworkScores.forEach((score, i) => {
    table.addRow({
      name: FRAMEWORK_WITH_OWNER_LIST[i].name,
      score,
      normalized: normalizeFromList({ target: score, list: allFrameworkScores }),
    })
  })

  saveResultToFile(table.toString(), 'evaluate-star')
}

main()
