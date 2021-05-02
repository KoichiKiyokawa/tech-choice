import { PrismaClient } from "@prisma/client";
import {
  GetCommitHistory,
  GetCommitHistoryQuery,
  GetCommitHistoryQueryVariables,
} from "../generated/graphql";
import { urql } from "../modules/urql";
import dayjs from "dayjs";

const prisma = new PrismaClient();

/**
 * 与えられたフレームワークの、直近1年のコミットとを収集する
 * @example `ts-node scripts/gather-commit.ts <frameworkId>`
 */
async function main() {
  // const frameworkId = process.argv[2];
  // if (frameworkId) console.log({ frameworkId });

  const nameWithOwnerList: { name: string; owner: string }[] = [
    { name: "svelte", owner: "sveltejs" },
    { name: "react", owner: "facebook" },
    { name: "vue", owner: "vuejs" },
  ];

  for (const { name, owner } of nameWithOwnerList) {
    const result = await urql
      .query<GetCommitHistoryQuery, GetCommitHistoryQueryVariables>(
        GetCommitHistory,
        { name, owner, since: "2020-01-01T00:00:00+0000" }
      )
      .toPromise();
    const target = result.data?.repository?.defaultBranchRef?.target;
    if (target?.__typename === "Commit") {
      const score = target.history.nodes
        ?.flatMap((commit) => {
          if (commit == null) return [];
          return (
            (commit.additions + commit.deletions) /
            (Math.abs(dayjs(commit.pushedDate).diff(new Date(), "day")) || 1)
          );
        })
        .reduce((sum, c) => sum + c, 0);

      console.log(`${name}: ${score}`);
    }
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
