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

  const allFrameworkDownloads = await Promise.all(FRAMEWORK_WITH_OWNER_LIST.map(fetchDownloadsV2))

  for (let i = 0; i < FRAMEWORK_WITH_OWNER_LIST.length; i++) {
    const nameWithOwner = FRAMEWORK_WITH_OWNER_LIST[i]

    const { id: frameworkId } =
      (await prisma.framework.findUnique({
        where: { owner_name: pick(nameWithOwner, ['name', 'owner']) },
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
