-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "frameworkId" INTEGER NOT NULL,
    "maintenance" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_frameworkId_unique" ON "Score"("frameworkId");

-- AddForeignKey
ALTER TABLE "Score" ADD FOREIGN KEY ("frameworkId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;
