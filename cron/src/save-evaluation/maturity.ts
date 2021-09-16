import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { calcMaturityForSpecificFramework } from '../evaluation/maturity'
import { fetchVersionHistory } from '../fetcher/fetch-version-history'
import { DateISOstring } from '../types/date'

const prisma = new PrismaClient()

async function main() {
  const frameworkList = await prisma.framework.findMany()

  const nameToMaturityMap = new Map(
    await Promise.all<[string, Decimal]>(
      frameworkList.map(async (framework) => {
        const stableVersionHistory: DateISOstring[] = await fetchVersionHistory(
          framework.npmName ?? framework.name,
        )

        return [framework.name, calcMaturityForSpecificFramework({ stableVersionHistory })]
      }),
    ),
  )

  console.log(nameToMaturityMap)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
