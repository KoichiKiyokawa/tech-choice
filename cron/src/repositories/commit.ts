import { Framework, PrismaClient } from '@prisma/client'
import { fetchCommits } from '../fetcher/fetch-commits'

const prisma = new PrismaClient()

async function main() {
  const frameworks = await prisma.framework.findMany()
  await Promise.all(frameworks.map(handleEachFramework))
}

async function handleEachFramework(framework: Framework) {
  const lastFetchedCommit = await prisma.commit.findFirst({
    where: { frameworkId: framework.id },
    orderBy: { committedAt: 'desc' },
  })
  const commits = await fetchCommits({
    name: framework.name,
    owner: framework.owner,
    lastCommittedAt: lastFetchedCommit?.committedAt,
  })
  await prisma.commit.createMany({
    skipDuplicates: true,
    data: commits.map((commit) => ({
      id: commit.id,
      additions: commit.additions,
      deletions: commit.deletions,
      committedAt: commit.committedDate,
      frameworkId: framework.id,
    })),
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
