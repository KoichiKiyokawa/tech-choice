import { PrismaClient } from '@prisma/client'
import { FRAMEWORK_DATA } from '../constants/framework-data'
import { FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map((nameWithOwner) => {
      const data = FRAMEWORK_DATA.find((f) => f.name === nameWithOwner.name)
      const operator = { ...nameWithOwner, ...data }
      return prisma.framework.upsert({
        create: operator,
        update: operator,
        where: { owner_name: nameWithOwner },
      })
    }),
  )
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) // .finally(prisma.$disconnect)とすると `Cannot read property '_clientVersion' of undefined`エラーがでる
