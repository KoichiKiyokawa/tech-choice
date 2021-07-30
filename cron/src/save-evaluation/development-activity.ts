import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { Frameworks, FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { calcActivityScoreForSpecificFramework } from '../evaluation/development-activity'
import { normalizeFromList } from '../utils/math'

const prisma = new PrismaClient()

async function main() {
  const nameWithScoreMap = new Map<Frameworks, Decimal>()
  for (const { name } of FRAMEWORK_WITH_OWNER_LIST) {
    const commitList = await prisma.commit.findMany({ where: { framework: { name } } })
    nameWithScoreMap.set(name, calcActivityScoreForSpecificFramework(commitList))
  }

  for (const frameworkWithOwner of FRAMEWORK_WITH_OWNER_LIST) {
    const thisFrameworkScore = nameWithScoreMap.get(frameworkWithOwner.name)!
    const normalizedScore = normalizeFromList({
      target: thisFrameworkScore,
      list: Array.from(nameWithScoreMap.values()),
    })

    const operation = { developmentActivity: normalizedScore.toNumber() }
    await prisma.framework.update({
      where: { owner_name: frameworkWithOwner },
      data: { score: { upsert: { create: operation, update: operation } } },
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
