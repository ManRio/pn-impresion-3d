-- CreateEnum
CREATE TYPE "SavedDesignStatus" AS ENUM ('TO_REVIEW', 'SHORTLIST', 'DISCARDED');

-- CreateTable
CREATE TABLE "SavedDesign" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "designer" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" "SavedDesignStatus" NOT NULL DEFAULT 'TO_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedDesign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedDesign_status_createdAt_idx" ON "SavedDesign"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedDesign_platform_externalId_key" ON "SavedDesign"("platform", "externalId");
