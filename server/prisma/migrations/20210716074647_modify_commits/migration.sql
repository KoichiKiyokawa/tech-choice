/*
  Warnings:

  - The primary key for the `Commit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `commitedAt` on the `Commit` table. All the data in the column will be lost.
  - You are about to drop the column `minusCount` on the `Commit` table. All the data in the column will be lost.
  - You are about to drop the column `plusCount` on the `Commit` table. All the data in the column will be lost.
  - Added the required column `additions` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `committedAt` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletions` to the `Commit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_pkey",
DROP COLUMN "commitedAt",
DROP COLUMN "minusCount",
DROP COLUMN "plusCount",
ADD COLUMN     "additions" INTEGER NOT NULL,
ADD COLUMN     "committedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deletions" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "Commit_id_seq";
