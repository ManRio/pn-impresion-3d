-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "taxableBaseCents" INTEGER,
ADD COLUMN     "vatCents" INTEGER,
ADD COLUMN     "vatRatePercent" INTEGER;
