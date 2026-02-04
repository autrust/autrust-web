-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "manageToken" TEXT;

-- CreateTable
CREATE TABLE "ListingReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "provider" TEXT NOT NULL,
    "country" TEXT,
    "vin" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "stripeSessionId" TEXT,
    "reportUrl" TEXT,
    "reportJson" JSONB,
    "errorMessage" TEXT,
    "listingId" TEXT NOT NULL,
    CONSTRAINT "ListingReport_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingReport_stripeSessionId_key" ON "ListingReport"("stripeSessionId");

-- CreateIndex
CREATE INDEX "ListingReport_listingId_idx" ON "ListingReport"("listingId");

-- CreateIndex
CREATE INDEX "ListingReport_status_idx" ON "ListingReport"("status");

-- CreateIndex
CREATE INDEX "Listing_manageToken_idx" ON "Listing"("manageToken");
