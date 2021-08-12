import { PrismaClient } from '@prisma/client'
import { pick } from 'rhodash'
import { FRAMEWORK_WITH_OWNER_LIST } from '../../constants/framework-list'
import { fetchDownloadsV2 } from '../../fetcher/fetch-downloads-v2'

const prisma = new PrismaClient()

/**
 * 対象すべてのフレームワークのダウンロード数を取得してDBに保存
 */
async function main() {
  await prisma.$connect()

  const allFrameworkDownloads = await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map((fwo) => fetchDownloadsV2({ name: fwo.npmName ?? fwo.name })),
  )

  for (let i = 0; i < FRAMEWORK_WITH_OWNER_LIST.length; i++) {
    const nameWithOwner = pick(FRAMEWORK_WITH_OWNER_LIST[i], ['name', 'owner'])

    const { id: frameworkId } =
      (await prisma.framework.findUnique({
        where: { owner_name: nameWithOwner },
      })) ?? {}
    if (frameworkId === undefined) continue

    const thisFrameworkDownloads = allFrameworkDownloads[i]

    await prisma.download.createMany({
      data: thisFrameworkDownloads.map((d) => ({
        frameworkId,
        count: d.count,
        downloadedAt: d.downloadedAt,
      })),
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
