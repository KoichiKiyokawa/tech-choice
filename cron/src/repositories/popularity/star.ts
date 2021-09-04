import { PrismaClient } from '@prisma/client'
import { pick } from 'rhodash'
import { FRAMEWORK_WITH_OWNER_LIST } from '../../constants/framework-list'
import { fetchStarredAtList } from '../../fetcher/fetch-starred-at-list'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  /**
   * FRAMEWORK_WITH_OWNER_LISTに格納されている順で、star履歴を取得する
   */
  const allFrameworkStarHistories = await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map((fwo) =>
      fetchStarredAtList({ name: fwo.repoName ?? fwo.name, owner: fwo.owner }),
    ),
  )

  for (let i = 0; i < FRAMEWORK_WITH_OWNER_LIST.length; i++) {
    const frameworkWithOwner = pick(FRAMEWORK_WITH_OWNER_LIST[i], ['name', 'owner'])
    const frameworkResult = await prisma.framework.findUnique({
      where: {
        owner_name: frameworkWithOwner,
      },
    })
    if (frameworkResult == undefined) continue

    const thisFrameworkStarHistories = allFrameworkStarHistories[i]
    await prisma.star.createMany({
      skipDuplicates: true,
      data: thisFrameworkStarHistories.map((history) => ({
        frameworkId: frameworkResult.id,
        starredAt: history.starredAt,
        id: history.id,
      })),
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
