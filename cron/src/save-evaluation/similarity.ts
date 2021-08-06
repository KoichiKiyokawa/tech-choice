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
    if (fwA.codeURL == null || fwB.codeURL == null) continue

    const [codeA, codeB] = await Promise.all([fwA.codeURL, fwB.codeURL].map(fetchCodeFromUrl))
    if (codeA == null || codeB == null) continue

    // TODO: 他のNものほうが適切な可能性もある
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
