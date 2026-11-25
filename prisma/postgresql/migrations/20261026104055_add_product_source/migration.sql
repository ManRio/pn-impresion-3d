/*
  Warnings:

  - A unique constraint covering the columns `[sourcePlatform,sourceModelId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "commercialPermission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceDesigner" TEXT,
ADD COLUMN     "sourceLicense" TEXT,
ADD COLUMN     "sourceModelId" TEXT,
ADD COLUMN     "sourcePlatform" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sourcePlatform_sourceModelId_key" ON "Product"("sourcePlatform", "sourceModelId");
