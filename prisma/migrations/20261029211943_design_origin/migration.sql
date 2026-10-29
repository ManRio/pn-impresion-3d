-- CreateEnum
CREATE TYPE "DesignOrigin" AS ENUM ('OWN', 'CUSTOM', 'THIRD_PARTY');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "designOrigin" "DesignOrigin" NOT NULL DEFAULT 'OWN';
