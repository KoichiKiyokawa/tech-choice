import dayjs from 'dayjs'
import { Decimal } from 'decimal.js'
import { FRAMEWORK_WITH_OWNER_LIST } from '../../constants/framework-list'
import { fetchStarredAtList } from '../../fetcher/fetch-starred-at-list'
import { DateISOstring } from '../../types/date'
import { calcAgingScore } from '../../utils/date'
import { saveResultToFile } from '../../utils/file'
import { normalizeFromList } from '../../utils/math'
import { MarkdownTable } from '../../utils/table'

async function main() {
  const allFrameworkResults: DateISOstring[][] = await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map(fetchStarredAtList),
  )

  const allFrameworkScores: Decimal[] = allFrameworkResults.map((result) =>
    result.reduce(
      (acc, starredAt) => acc.plus(calcAgingScore(dayjs().diff(starredAt, 'days'))),
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
