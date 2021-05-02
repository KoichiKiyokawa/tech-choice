import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// A `main` function so that you can use async/await
async function main() {
  // ... you will write your Prisma Client queries here
  const ownerWithNameList: { owner: "sveltejs"; name: "svelte" }[] = [
    { owner: "sveltejs", name: "svelte" },
    // TODO: add more and more frameworks!!!
  ];

  for (const ownerWithName of ownerWithNameList) {
    await prisma.framework.create({
      data: { ...ownerWithName },
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
