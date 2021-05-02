import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 与えられたフレームワークの、直近1年のコミットとを収集する
 * @example `ts-node scripts/gather-commit.ts <frameworkId>`
 */
async function main() {
  const frameworkId = process.argv[2];
  if (frameworkId) console.log({ frameworkId });

  // ... you will write your Prisma Client queries here
  // const ownerWithNameList: { owner: "sveltejs"; name: "svelte" }[] = [
  //   { owner: "sveltejs", name: "svelte" },
  //   // TODO: add more and more frameworks!!!
  // ];
  // for (const ownerWithName of ownerWithNameList) {
  //   await prisma.framework.create({
  //     data: { ...ownerWithName },
  //   });
  // }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
