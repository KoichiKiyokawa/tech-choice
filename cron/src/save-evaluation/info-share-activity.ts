import { Framework, PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { fixedLastCalculatedAt } from '../constants/date'
import { calcInfoShareActivityForSepcificFramework } from '../evaluation/question'
import { normalizeFromList } from '../utils/math'

const prisma = new PrismaClient()

/** 情報共有の活発さを計算する */
async function main() {
  const frameworkList = await prisma.framework.findMany()
  /** 正規化前の値 */
  const frameworkNameToOriginalScore: Map<string, Decimal> = new Map()
  await Promise.all(
    frameworkList.map(async (framework) => {
      const originalScore = await calEachFrameworkInfoShareActivity(framework)
      frameworkNameToOriginalScore.set(framework.name, originalScore)
    }),
  )

  await Promise.all(
    frameworkList.map(async (framework) => {
      const normalizedScore = normalizeFromList({
        target: frameworkNameToOriginalScore.get(framework.name)!,
        list: Array.from(frameworkNameToOriginalScore.values()),
      }).toNumber()
      await prisma.framework.update({
        where: { id: framework.id },
        data: {
          score: {
            upsert: {
              create: { infoShareActivity: normalizedScore },
              update: { infoShareActivity: normalizedScore },
            },
          },
        },
      })
    }),
  )
}

/** @private */
async function calEachFrameworkInfoShareActivity(framework: Framework): Promise<Decimal> {
  const [questions, issueComments] = await Promise.all([
    prisma.question.findMany({
      where: { frameworkId: framework.id, askedAt: { lte: fixedLastCalculatedAt } },
    }),
    prisma.issueComment.findMany({
      where: { frameworkId: framework.id, postedAt: { lte: fixedLastCalculatedAt } },
    }),
  ])
  const infoShareActivity = calcInfoShareActivityForSepcificFramework({
    questions,
    issueComments,
  })
  return infoShareActivity
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
