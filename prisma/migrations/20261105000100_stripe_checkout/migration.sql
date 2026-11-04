-- Almacena identificadores de Stripe sin sobrescribir los pedidos históricos.
ALTER TABLE "Order"
  ADD COLUMN "stripeCheckoutSessionId" TEXT,
  ADD COLUMN "stripePaymentIntentId" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key"
  ON "Order"("stripeCheckoutSessionId");
