-- CreateTable
CREATE TABLE "QuoteInternalNote" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "statusFrom" "QuoteStatus" NOT NULL,
    "statusTo" "QuoteStatus" NOT NULL,
    "reference" TEXT,
    "amountCents" INTEGER,
    "itemsSummary" TEXT,
    "deliveryEstimate" TEXT,
    "sentToCustomer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteInternalNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteInternalNote_quoteId_createdAt_idx" ON "QuoteInternalNote"("quoteId", "createdAt");

-- AddForeignKey
ALTER TABLE "QuoteInternalNote" ADD CONSTRAINT "QuoteInternalNote_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
