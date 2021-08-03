import { PrismaClient } from '@prisma/client'
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

  for (let N = 1; N <= 10; N++) {
    console.log(`-----------N = ${N}-------------`)

    for (const [fwA, fwB] of combinationIterator(frameworks)) {
      if (fwA.codeURL == null || fwB.codeURL == null) continue

      const [codeA, codeB] = await Promise.all([fwA.codeURL, fwB.codeURL].map(fetchCodeFromUrl))
      if (codeA == null || codeB == null) continue

      const sim = calcCodeSimilarity(codeA, codeB, { N })
      console.log(`${fwA.name} vs ${fwB.name} : ${sim}`)
    }
  }
}

main()
