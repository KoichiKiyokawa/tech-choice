import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { calcMaturityForSpecificFramework } from '../evaluation/maturity'
import { fetchVersionHistory } from '../fetcher/fetch-version-history'
import { DateISOstring } from '../types/date'
import { normalizeFromMap } from '../utils/math'

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

  await Promise.all(
    frameworkList.map(async (framework) => {
      const maturity = normalizeFromMap({
        targetKey: framework.name,
        map: nameToMaturityMap,
      }).toNumber()

      await prisma.framework.update({
        where: { id: framework.id },
        data: {
          score: { upsert: { create: { maturity }, update: { maturity } } },
        },
      })
    }),
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
