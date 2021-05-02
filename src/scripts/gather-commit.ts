import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 与えられたフレームワークの、直近1年のコミットとを収集する
 * @example `ts-node scripts/gather-commit.ts <frameworkId>`
 */
async function main() {
  // const frameworkId = process.argv[2];
  // if (frameworkId) console.log({ frameworkId });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
