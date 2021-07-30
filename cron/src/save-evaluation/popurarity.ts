import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { Frameworks, FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { calcPopularityScoreForSpecificFramework } from '../evaluation/popularity'
import { normalizeFromList } from '../utils/math'

const prisma = new PrismaClient()
async function main() {
  const nameWithScoreMap = new Map<Frameworks, Decimal>()
  for (const frameworkWithOwner of FRAMEWORK_WITH_OWNER_LIST) {
    const [downloadHistories, starHistories] = await Promise.all([
      prisma.download.findMany({ where: { framework: { name: frameworkWithOwner.name } } }),
      prisma.star.findMany({ where: { framework: { name: frameworkWithOwner.name } } }),
    ])

    nameWithScoreMap.set(
      frameworkWithOwner.name,
      calcPopularityScoreForSpecificFramework({ downloadHistories, starHistories }),
    )
  }

  // normalize
  for (const frameworkWithOwner of FRAMEWORK_WITH_OWNER_LIST) {
    const thisFrameworkScore = nameWithScoreMap.get(frameworkWithOwner.name)
    if (thisFrameworkScore == null) continue

    const normalizedScore = normalizeFromList({
      target: thisFrameworkScore,
      list: Array.from(nameWithScoreMap.values()),
    })

    const operation = { popularity: normalizedScore.toNumber() }
    await prisma.framework.update({
      where: { owner_name: frameworkWithOwner },
      data: { score: { upsert: { create: operation, update: operation } } },
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
