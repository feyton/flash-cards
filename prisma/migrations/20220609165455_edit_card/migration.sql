-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "content" TEXT,
ADD COLUMN     "done" BOOLEAN NOT NULL DEFAULT false;
