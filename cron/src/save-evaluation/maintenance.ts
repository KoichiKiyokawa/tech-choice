import { PrismaClient } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { Frameworks, FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { calcMaintenanceSubScoresForSpecificFramework } from '../evaluation/maintenance'
import { normalizeFromList } from '../utils/math'

type Scores = {
  issueCloseSpeedScore: Decimal
  issueCommentByCollaboratorScore: Decimal
  abandonedScore: Decimal
}

const prisma = new PrismaClient()

async function main() {
  // 最後に正規化を行うために、各フレームワークの点数を格納しておくMap
  const frameworkWithScoreMap: Map<Frameworks, Scores> = new Map()

  // 各フレームワークの issueCloseSpeedScore, issueCommentByCollaboratorScore, abandonedScore を計算
  for (const frameworkWithOwner of FRAMEWORK_WITH_OWNER_LIST) {
    const collaboratorUserNameList = (
      await prisma.collaborator.findMany({
        where: { framework: { name: frameworkWithOwner.name } },
      })
    ).map((res) => res.name)
    const issueList = await prisma.issue.findMany({
      include: { issueComments: true },
      where: { framework: { name: frameworkWithOwner.name } },
    })

    frameworkWithScoreMap.set(
      frameworkWithOwner.name,
      calcMaintenanceSubScoresForSpecificFramework({ collaboratorUserNameList, issueList }),
    )
  } // end of each framework loop

  // normalize for each framework
  for (const frameworkWithOwner of FRAMEWORK_WITH_OWNER_LIST) {
    const thisFrameworkScores = frameworkWithScoreMap.get(frameworkWithOwner.name)
    if (thisFrameworkScores == null) continue

    const normalizedIssueCloseSpeedScore =
      normalizeFromList({
        target: thisFrameworkScores.issueCloseSpeedScore,
        list: Array.from(frameworkWithScoreMap.values()).map((v) => v.issueCloseSpeedScore),
      }) || 0 // 0で割るなどしてNaNが発生したときに、0に丸め込む
    const normalizedIssueCommentByCollaboratorScore =
      normalizeFromList({
        target: thisFrameworkScores.issueCommentByCollaboratorScore,
        list: Array.from(frameworkWithScoreMap.values()).map(
          (v) => v.issueCommentByCollaboratorScore,
        ),
      }) || 0
    const normalizedAbandonedScore =
      normalizeFromList({
        target: thisFrameworkScores.abandonedScore,
        list: Array.from(frameworkWithScoreMap.values()).map((v) => v.abandonedScore),
      }) || 0

    const maintenanceScore = normalizedIssueCloseSpeedScore
      .plus(normalizedIssueCommentByCollaboratorScore)
      .minus(normalizedAbandonedScore)

    const operation = { maintenance: maintenanceScore.toNumber() }
    await prisma.framework.update({
      where: { owner_name: frameworkWithOwner },
      data: { score: { upsert: { create: operation, update: operation } } },
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
