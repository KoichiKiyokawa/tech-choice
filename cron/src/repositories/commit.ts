import { PrismaClient } from '@prisma/client'
import { pick } from 'rhodash'
import { FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { fetchCommits } from '../fetcher/fetch-commits'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  /**
   * FRAMEWORK_WITH_OWNER_LISTに格納されている順で、コミットを取得する
   */
  const allFrameworkCommits = await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map((fwo) =>
      fetchCommits({ name: fwo.repoName ?? fwo.name, owner: fwo.owner }),
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

    const thisFrameworkCommits = allFrameworkCommits[i]

    await prisma.commit.createMany({
      skipDuplicates: true,
      data: thisFrameworkCommits.map((commit) => ({
        id: commit.id,
        additions: commit.additions,
        deletions: commit.deletions,
        committedAt: commit.committedDate,
        frameworkId: frameworkResult.id,
      })),
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
