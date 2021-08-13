import { PrismaClient } from '.prisma/client'
import { pick } from 'rhodash'
import { FRAMEWORK_WITH_OWNER_LIST } from '../constants/framework-list'
import { fetchIssueAndComments } from '../fetcher/fetch-issue-and-comment'

const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()

  const allFrameworkIssues = await Promise.all(
    FRAMEWORK_WITH_OWNER_LIST.map((fwo) =>
      fetchIssueAndComments({ name: fwo.repoName ?? fwo.name, owner: fwo.owner }),
    ),
  )

  for (let i = 0; i < FRAMEWORK_WITH_OWNER_LIST.length; i++) {
    const nameWithOwner = pick(FRAMEWORK_WITH_OWNER_LIST[i], ['name', 'owner'])
    const { id: frameworkId } =
      (await prisma.framework.findUnique({
        where: { owner_name: nameWithOwner },
      })) ?? {}
    if (frameworkId === undefined) continue

    const thisFrameworkIssues = allFrameworkIssues[i]

    // issueをDBに保存 (createManyではissueCommentまでは一括で登録できない)
    for (const issue of thisFrameworkIssues) {
      if (issue == null) continue

      await prisma.issue.create({
        data: {
          closedAt: issue.closedAt ?? undefined,
          openedAt: issue.createdAt,
          framework: { connect: { owner_name: nameWithOwner } },
          issueComments: {
            create: issue.comments.nodes?.flatMap((comment) =>
              !comment
                ? []
                : {
                    framework: { connect: { owner_name: nameWithOwner } },
                    postedAt: comment.createdAt,
                    body: comment.body,
                    author: comment.author?.login ?? '',
                  },
            ),
          },
        },
      })
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
