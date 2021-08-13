/*
  Warnings:

  - You are about to drop the column `codeURL` on the `Framework` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Framework" DROP COLUMN "codeURL",
ADD COLUMN     "codeURLs" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "npmName" TEXT,
ADD COLUMN     "repoName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
