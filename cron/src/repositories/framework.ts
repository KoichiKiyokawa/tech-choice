import { PrismaClient } from '@prisma/client'
import { FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map((operator) =>
      prisma.framework.upsert({
        create: operator,
        update: operator,
        where: { owner_name: { name: operator.name, owner: operator.owner } },
      }),
    ),
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) // .finally(prisma.$disconnect)とすると `Cannot read property '_clientVersion' of undefined`エラーがでる
