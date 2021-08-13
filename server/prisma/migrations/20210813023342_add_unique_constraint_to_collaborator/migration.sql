/*
  Warnings:

  - A unique constraint covering the columns `[frameworkId,name]` on the table `Collaborator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Collaborator.frameworkId_name_unique" ON "Collaborator"("frameworkId", "name");
