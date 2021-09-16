-- DropForeignKey
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "Commit" DROP CONSTRAINT "Commit_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "Download" DROP CONSTRAINT "Download_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "IssueComment" DROP CONSTRAINT "IssueComment_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "IssueComment" DROP CONSTRAINT "IssueComment_issueId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_frameworkId_fkey";

-- DropForeignKey
ALTER TABLE "Similarity" DROP CONSTRAINT "Similarity_comparisonId_fkey";

-- DropForeignKey
ALTER TABLE "Similarity" DROP CONSTRAINT "Similarity_targetId_fkey";

-- DropForeignKey
ALTER TABLE "Star" DROP CONSTRAINT "Star_frameworkId_fkey";

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "maturity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Download" ADD CONSTRAINT "Download_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Star" ADD CONSTRAINT "Star_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Similarity" ADD CONSTRAINT "Similarity_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Similarity" ADD CONSTRAINT "Similarity_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Collaborator.frameworkId_name_unique" RENAME TO "Collaborator_frameworkId_name_key";

-- RenameIndex
ALTER INDEX "Download.frameworkId_downloadedAt_unique" RENAME TO "Download_frameworkId_downloadedAt_key";

-- RenameIndex
ALTER INDEX "Framework.owner_name_unique" RENAME TO "Framework_owner_name_key";
