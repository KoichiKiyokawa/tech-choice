/*
  Warnings:

  - A unique constraint covering the columns `[frameworkId,downloadedAt]` on the table `Download` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Download.frameworkId_downloadedAt_unique" ON "Download"("frameworkId", "downloadedAt");
