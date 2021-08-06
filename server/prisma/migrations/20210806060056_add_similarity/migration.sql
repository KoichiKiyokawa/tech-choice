-- CreateTable
CREATE TABLE "Similarity" (
    "targetId" INTEGER NOT NULL,
    "comparisonId" INTEGER NOT NULL,
    "cosineSimilarity" DOUBLE PRECISION NOT NULL,

    PRIMARY KEY ("targetId","comparisonId")
);

-- AddForeignKey
ALTER TABLE "Similarity" ADD FOREIGN KEY ("targetId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Similarity" ADD FOREIGN KEY ("comparisonId") REFERENCES "Framework"("id") ON DELETE CASCADE ON UPDATE CASCADE;
