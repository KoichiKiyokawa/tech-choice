-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL,
    "frameworkId" INTEGER NOT NULL,
    "askedAt" TIMESTAMP(3) NOT NULL,
    "answerCount" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_frameworkId_unique" ON "Question"("frameworkId");

-- AddForeignKey
ALTER TABLE "Question" ADD FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;
