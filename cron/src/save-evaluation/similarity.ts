import { PrismaClient, Similarity } from '@prisma/client'
import fetch from 'node-fetch'
import { calcCodeSimilarity } from '../evaluation/similarity'
import { combinationIterator } from '../utils/math'

const prisma = new PrismaClient()

async function fetchCodeFromUrl(url: string): Promise<string | null> {
  return fetch(url)
    .then((res) => res.text())
    .catch(() => null)
}

async function main() {
  const frameworks = await prisma.framework.findMany()

  for (const [fwA, fwB] of combinationIterator(frameworks)) {
    if (fwA.codeURLs == null || fwB.codeURLs == null) continue

    const [codeAs, codeBs] = await Promise.all([
      Promise.all(fwA.codeURLs.map(fetchCodeFromUrl)),
      Promise.all(fwB.codeURLs.map(fetchCodeFromUrl)),
    ])
    if (codeAs.some((code) => code == null))
      console.error(`[save-evaluation/similarity] fetched code is empty for framework: ${fwA.name}`)
    if (codeBs.some((code) => code == null))
      console.error(`[save-evaluation/similarity] fetched code is empty for framework: ${fwB.name}`)
    const codeA = codeAs.join('\n')
    const codeB = codeBs.join('\n')

    // TODO: 他のNのほうが適切な可能性もある
    const sim = calcCodeSimilarity(codeA, codeB, { N: 3 })

    const operator: Similarity = {
      targetId: fwA.id,
      comparisonId: fwB.id,
      cosineSimilarity: sim.toNumber(),
    }
    await prisma.similarity.upsert({
      create: operator,
      update: operator,
      where: {
        targetId_comparisonId: {
          targetId: fwA.id,
          comparisonId: fwB.id,
        },
      },
    })
  }
}

main().finally(() => prisma.$disconnect())
