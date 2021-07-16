/*
  Warnings:

  - Added the required column `author` to the `IssueComment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body` to the `IssueComment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" ALTER COLUMN "closedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "IssueComment" ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "body" TEXT NOT NULL;
