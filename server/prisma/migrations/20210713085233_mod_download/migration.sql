/*
  Warnings:

  - Added the required column `count` to the `Download` table without a default value. This is not possible if the table is not empty.
  - Added the required column `downloadedAt` to the `Download` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Download" ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "downloadedAt" TIMESTAMP(3) NOT NULL;
