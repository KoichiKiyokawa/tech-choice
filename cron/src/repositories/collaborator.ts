import { PrismaClient } from '.prisma/client'
import { FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { fetchCollaborators } from '../fetcher/fetch-collaborators'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  /**
   * FRAMEWORK_WITH_OWNER_LISTに格納されている順で、コラボレータを取得する
   */
  const allFrameworkCollaborators = await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map(fetchCollaborators),
  )

  for (let i = 0; i < FRAMEWORK_WITH_OWNER_LIST.length; i++) {
    const frameworkWithOwner = FRAMEWORK_WITH_OWNER_LIST[i]
    const frameworkResult = await prisma.framework.findUnique({
      where: {
        owner_name: { name: frameworkWithOwner.name, owner: frameworkWithOwner.owner },
      },
    })
    if (frameworkResult == undefined) continue

    const thisFrameworkCollaborators = allFrameworkCollaborators[i]

    await prisma.collaborator.createMany({
      skipDuplicates: true,
      data: thisFrameworkCollaborators.map((collaborator) => ({
        name: collaborator,
        frameworkId: frameworkResult.id,
      })),
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
