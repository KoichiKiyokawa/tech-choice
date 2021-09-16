import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { Frameworks } from '../constants/framework-list'
import { calcPopularityScoreForSpecificFramework } from '../evaluation/popularity'
import { normalizeFromMap } from '../utils/math'

const prisma = new PrismaClient()
async function main() {
  const frameworkList = await prisma.framework.findMany()
  const nameWithOriginalScoreMap = new Map<Frameworks, Decimal>(
    await Promise.all<[Frameworks, Decimal]>(
      frameworkList.map(async (framework) => {
        const [downloadHistories, starHistories] = await Promise.all([
          prisma.download.findMany({ where: { framework: { name: framework.name } } }),
          prisma.star.findMany({ where: { framework: { name: framework.name } } }),
        ])
        const thisFrameworkScore = calcPopularityScoreForSpecificFramework({
          downloadHistories,
          starHistories,
        })
        return [framework.name as Frameworks, thisFrameworkScore]
      }),
    ),
  )

  // 正規化
  await Promise.all(
    frameworkList.map(async (framework) => {
      const popularity = normalizeFromMap({
        targetKey: framework.name,
        map: nameWithOriginalScoreMap,
      }).toNumber()

      await prisma.framework.update({
        where: { id: framework.id },
        data: { score: { upsert: { create: { popularity }, update: { popularity } } } },
      })
    }),
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
