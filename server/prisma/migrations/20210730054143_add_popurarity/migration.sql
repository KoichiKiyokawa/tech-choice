-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "popularity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "maintenance" SET DEFAULT 0;