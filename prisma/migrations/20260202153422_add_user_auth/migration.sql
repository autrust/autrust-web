-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerifiedAt" DATETIME,
    "phone" TEXT,
    "phoneVerifiedAt" DATETIME
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PhoneOtp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PhoneOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserKyc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "verifiedAt" DATETIME,
    "stripeVerificationSessionId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserKyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserStripe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeConnectAccountId" TEXT,
    "connectChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "connectPayoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserStripe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "manageToken" TEXT,
    "sellerId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "km" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "vin" TEXT,
    "bodyType" TEXT,
    "color" TEXT,
    "fuel" TEXT,
    "gearbox" TEXT,
    "powerKw" INTEGER,
    "seats" INTEGER,
    "hasServiceBook" BOOLEAN NOT NULL DEFAULT false,
    "isNonSmoker" BOOLEAN NOT NULL DEFAULT false,
    "hasWarranty" BOOLEAN NOT NULL DEFAULT false,
    "isDamaged" BOOLEAN NOT NULL DEFAULT false,
    "make" TEXT,
    "model" TEXT,
    "trim" TEXT,
    "bodyClass" TEXT,
    "vehicleType" TEXT,
    "fuelType" TEXT,
    "transmission" TEXT,
    "transmissionSpeeds" INTEGER,
    "driveType" TEXT,
    "doors" INTEGER,
    "engineCylinders" INTEGER,
    "engineHp" INTEGER,
    "engineModel" TEXT,
    "displacementL" TEXT,
    "plantCountry" TEXT,
    "plantCity" TEXT,
    "manufacturer" TEXT,
    "vinData" JSONB,
    "vinOptions" JSONB,
    "sellerOptions" JSONB,
    "sellerOptionsNote" TEXT,
    "vinDecodedAt" DATETIME,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("bodyClass", "bodyType", "category", "city", "color", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "displacementL", "doors", "driveType", "engineCylinders", "engineHp", "engineModel", "fuel", "fuelType", "gearbox", "hasServiceBook", "hasWarranty", "id", "isDamaged", "isNonSmoker", "km", "make", "manageToken", "manufacturer", "model", "plantCity", "plantCountry", "powerKw", "price", "seats", "sellerOptions", "sellerOptionsNote", "status", "title", "transmission", "transmissionSpeeds", "trim", "updatedAt", "vehicleType", "vin", "vinData", "vinDecodedAt", "vinOptions", "year") SELECT "bodyClass", "bodyType", "category", "city", "color", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "displacementL", "doors", "driveType", "engineCylinders", "engineHp", "engineModel", "fuel", "fuelType", "gearbox", "hasServiceBook", "hasWarranty", "id", "isDamaged", "isNonSmoker", "km", "make", "manageToken", "manufacturer", "model", "plantCity", "plantCountry", "powerKw", "price", "seats", "sellerOptions", "sellerOptionsNote", "status", "title", "transmission", "transmissionSpeeds", "trim", "updatedAt", "vehicleType", "vin", "vinData", "vinDecodedAt", "vinOptions", "year" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE INDEX "Listing_category_price_year_km_idx" ON "Listing"("category", "price", "year", "km");
CREATE INDEX "Listing_city_idx" ON "Listing"("city");
CREATE INDEX "Listing_vin_idx" ON "Listing"("vin");
CREATE INDEX "Listing_manageToken_idx" ON "Listing"("manageToken");
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PhoneOtp_userId_idx" ON "PhoneOtp"("userId");

-- CreateIndex
CREATE INDEX "PhoneOtp_phone_idx" ON "PhoneOtp"("phone");

-- CreateIndex
CREATE INDEX "PhoneOtp_expiresAt_idx" ON "PhoneOtp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserKyc_stripeVerificationSessionId_key" ON "UserKyc"("stripeVerificationSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserKyc_userId_key" ON "UserKyc"("userId");

-- CreateIndex
CREATE INDEX "UserKyc_status_idx" ON "UserKyc"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserStripe_stripeCustomerId_key" ON "UserStripe"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStripe_stripeConnectAccountId_key" ON "UserStripe"("stripeConnectAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStripe_userId_key" ON "UserStripe"("userId");
