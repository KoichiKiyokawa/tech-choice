import { PrismaClient, Framework } from '@prisma/client'
import { calcInfoShareActivityForSepcificFramework } from '../evaluation/question'

const prisma = new PrismaClient()

async function main() {
  const frameworkList = await prisma.framework.findMany()
  await Promise.all(frameworkList.map(handleEachFramework))
}

/** @private */
async function handleEachFramework(framework: Framework) {
  const [questions, issueWithCommentList] = await Promise.all([
    prisma.question.findMany({ where: { frameworkId: framework.id } }),
    prisma.issue.findMany({
      where: { frameworkId: framework.id },
      include: { issueComments: true },
    }),
  ])
  const infoShareActivity = calcInfoShareActivityForSepcificFramework({
    questions,
    issueWithCommentList,
  }).toNumber()

  await prisma.framework.update({
    where: { id: framework.id },
    data: {
      score: {
        upsert: {
          create: { infoShareActivity },
          update: { infoShareActivity },
        },
      },
    },
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
