import { PrismaClient } from "@prisma/client";
import {
  GetCommitHistory,
  GetCommitHistoryQuery,
  GetCommitHistoryQueryVariables,
} from "../generated/graphql";
import { urql } from "../modules/urql";

const prisma = new PrismaClient();

/**
 * 与えられたフレームワークの、直近1年のコミットとを収集する
 * @example `ts-node scripts/gather-commit.ts <frameworkId>`
 */
async function main() {
  // const frameworkId = process.argv[2];
  // if (frameworkId) console.log({ frameworkId });

  const result = await urql
    .query<GetCommitHistoryQuery, GetCommitHistoryQueryVariables>(
      GetCommitHistory,
      { name: "svelte", owner: "sveltejs", since: "2020-01-01T00:00:00+0000" }
    )
    .toPromise();
  const target = result.data?.repository?.defaultBranchRef?.target;
  if (target?.__typename === "Commit") {
    target.history.nodes?.map((commit) => {
      console.log(commit);
    });
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
