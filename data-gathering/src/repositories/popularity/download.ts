import { PrismaClient } from '@prisma/client'
import { FRAMEWORK_WITH_OWNER_LIST } from '../../constants/framework-list'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  await prisma.framework.createMany({
    skipDuplicates: true,
    data: FRAMEWORK_WITH_OWNER_LIST.map(({ name, owner }) => ({
      name,
      owner,
    })),
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
