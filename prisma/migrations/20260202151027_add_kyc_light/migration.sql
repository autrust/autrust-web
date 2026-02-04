-- CreateTable
CREATE TABLE "ListingKyc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "documentType" TEXT NOT NULL,
    "idDocPath" TEXT NOT NULL,
    "idDocMime" TEXT NOT NULL,
    "idDocOriginalName" TEXT NOT NULL,
    "selfiePath" TEXT,
    "selfieMime" TEXT,
    "selfieOriginalName" TEXT,
    "listingId" TEXT NOT NULL,
    CONSTRAINT "ListingKyc_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingKyc_listingId_key" ON "ListingKyc"("listingId");

-- CreateIndex
CREATE INDEX "ListingKyc_status_idx" ON "ListingKyc"("status");

-- CreateIndex
CREATE INDEX "ListingKyc_listingId_idx" ON "ListingKyc"("listingId");
