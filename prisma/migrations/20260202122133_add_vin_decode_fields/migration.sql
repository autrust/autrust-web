-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "bodyClass" TEXT;
ALTER TABLE "Listing" ADD COLUMN "doors" INTEGER;
ALTER TABLE "Listing" ADD COLUMN "driveType" TEXT;
ALTER TABLE "Listing" ADD COLUMN "engineCylinders" INTEGER;
ALTER TABLE "Listing" ADD COLUMN "engineHp" INTEGER;
ALTER TABLE "Listing" ADD COLUMN "fuelType" TEXT;
ALTER TABLE "Listing" ADD COLUMN "make" TEXT;
ALTER TABLE "Listing" ADD COLUMN "manufacturer" TEXT;
ALTER TABLE "Listing" ADD COLUMN "model" TEXT;
ALTER TABLE "Listing" ADD COLUMN "plantCity" TEXT;
ALTER TABLE "Listing" ADD COLUMN "plantCountry" TEXT;
ALTER TABLE "Listing" ADD COLUMN "transmission" TEXT;
ALTER TABLE "Listing" ADD COLUMN "trim" TEXT;
ALTER TABLE "Listing" ADD COLUMN "vehicleType" TEXT;
ALTER TABLE "Listing" ADD COLUMN "vin" TEXT;
ALTER TABLE "Listing" ADD COLUMN "vinData" JSONB;
ALTER TABLE "Listing" ADD COLUMN "vinDecodedAt" DATETIME;

-- CreateIndex
CREATE INDEX "Listing_vin_idx" ON "Listing"("vin");
