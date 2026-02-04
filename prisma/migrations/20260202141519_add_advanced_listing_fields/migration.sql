-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "manageToken" TEXT,
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
    "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);
INSERT INTO "new_Listing" ("bodyClass", "bodyType", "category", "city", "color", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "displacementL", "doors", "driveType", "engineCylinders", "engineHp", "engineModel", "fuelType", "id", "km", "make", "manageToken", "manufacturer", "model", "plantCity", "plantCountry", "price", "sellerOptions", "sellerOptionsNote", "status", "title", "transmission", "transmissionSpeeds", "trim", "updatedAt", "vehicleType", "vin", "vinData", "vinDecodedAt", "vinOptions", "year") SELECT "bodyClass", "bodyType", "category", "city", "color", "contactEmail", "contactName", "contactPhone", "createdAt", "description", "displacementL", "doors", "driveType", "engineCylinders", "engineHp", "engineModel", "fuelType", "id", "km", "make", "manageToken", "manufacturer", "model", "plantCity", "plantCountry", "price", "sellerOptions", "sellerOptionsNote", "status", "title", "transmission", "transmissionSpeeds", "trim", "updatedAt", "vehicleType", "vin", "vinData", "vinDecodedAt", "vinOptions", "year" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE INDEX "Listing_category_price_year_km_idx" ON "Listing"("category", "price", "year", "km");
CREATE INDEX "Listing_city_idx" ON "Listing"("city");
CREATE INDEX "Listing_vin_idx" ON "Listing"("vin");
CREATE INDEX "Listing_manageToken_idx" ON "Listing"("manageToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
