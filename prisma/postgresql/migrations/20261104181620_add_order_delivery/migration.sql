-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryMethod" TEXT,
ADD COLUMN     "shippingCents" INTEGER,
ADD COLUMN     "subtotalCents" INTEGER;
