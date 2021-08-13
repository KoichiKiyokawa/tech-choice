import { PrismaClient } from '@prisma/client'
import { delay, pick } from 'rhodash'
import { FRAMEWORK_WITH_OWNER_LIST } from '../../constants/framework-list'
import { fetchDownloadsV2 } from '../../fetcher/fetch-downloads-v2'

const prisma = new PrismaClient()

/**
 * 対象すべてのフレームワークのダウンロード数を取得してDBに保存
 */
async function main() {
  await prisma.$connect()

  // API制限に引っかかるため、「すべてのフレームワークを並行にリクエストする」は自重する
  for (const frameworkWithOwner of FRAMEWORK_WITH_OWNER_LIST) {
    const { id: frameworkId } =
      (await prisma.framework.findUnique({
        where: { owner_name: pick(frameworkWithOwner, ['name', 'owner']) },
      })) ?? {}
    console.log({ frameworkId })
    if (frameworkId === undefined) continue

    console.log(frameworkWithOwner)
    const thisFrameworkDownloads = await fetchDownloadsV2({
      name: frameworkWithOwner.npmName ?? frameworkWithOwner.name,
    })

    await prisma.download.createMany({
      skipDuplicates: true,
      data: thisFrameworkDownloads.map((d) => ({
        frameworkId,
        count: d.count,
        downloadedAt: d.downloadedAt,
      })),
    })

    await delay(3000)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
