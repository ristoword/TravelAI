-- Additive travel search entities (safe: CREATE TABLE / ADD COLUMN only)
-- No DROP / TRUNCATE / DELETE.

-- Alter Enums: none required

-- CreateTable Flight
CREATE TABLE IF NOT EXISTS "Flight" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "externalId" TEXT,
    "airline" TEXT,
    "airlineLogoUrl" TEXT,
    "flightNumber" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "departAt" TIMESTAMP(3),
    "arriveAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "stops" INTEGER,
    "cabinClass" TEXT,
    "baggage" TEXT,
    "conditions" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "FlightSegment" (
    "id" TEXT NOT NULL,
    "flightId" TEXT,
    "flightOfferId" TEXT,
    "segmentOrder" INTEGER NOT NULL DEFAULT 0,
    "airline" TEXT,
    "flightNumber" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "departAt" TIMESTAMP(3),
    "arriveAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "originLat" DECIMAL(10,7),
    "originLng" DECIMAL(10,7),
    "destLat" DECIMAL(10,7),
    "destLng" DECIMAL(10,7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "FlightSegment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Hotel" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "starRating" INTEGER,
    "guestRating" DECIMAL(3,1),
    "reviewCount" INTEGER,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "distanceKm" DECIMAL(8,2),
    "description" TEXT,
    "cancellationPolicy" TEXT,
    "conditions" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HotelImage" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "HotelImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HotelAmenity" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "HotelAmenity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "HotelRoom" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxOccupancy" INTEGER,
    "bedType" TEXT,
    "priceAmount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "available" BOOLEAN,
    "cancellationPolicy" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "HotelRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CarRental" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "externalId" TEXT,
    "vendorName" TEXT,
    "vehicleName" TEXT,
    "category" TEXT,
    "transmission" TEXT,
    "seats" INTEGER,
    "bags" INTEGER,
    "fuelType" TEXT,
    "imageUrl" TEXT,
    "pickupLat" DECIMAL(10,7),
    "pickupLng" DECIMAL(10,7),
    "conditions" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "CarRental_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Comparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'HOTEL',
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ComparisonItem" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "hotelId" TEXT,
    "flightId" TEXT,
    "carRentalId" TEXT,
    "externalId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "ComparisonItem_pkey" PRIMARY KEY ("id")
);

-- Additive columns on existing offer tables
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "flightId" TEXT;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "airlineLogoUrl" TEXT;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "flightNumber" TEXT;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "origin" TEXT;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "destination" TEXT;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "departAt" TIMESTAMP(3);
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "arriveAt" TIMESTAMP(3);
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "stops" INTEGER;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "cabinClass" TEXT;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "baggage" TEXT;
ALTER TABLE "FlightOffer" ADD COLUMN IF NOT EXISTS "conditions" TEXT;

ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "hotelId" TEXT;
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "starRating" INTEGER;
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "guestRating" DECIMAL(3,1);
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER;
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7);
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7);
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "distanceKm" DECIMAL(8,2);
ALTER TABLE "HotelOffer" ADD COLUMN IF NOT EXISTS "amenitiesJson" JSONB;

ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "carRentalId" TEXT;
ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "vehicleName" TEXT;
ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "transmission" TEXT;
ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "seats" INTEGER;
ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "bags" INTEGER;
ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "fuelType" TEXT;
ALTER TABLE "CarOffer" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

ALTER TABLE "TripItem" ADD COLUMN IF NOT EXISTS "draftPayload" JSONB;

-- Indexes
CREATE INDEX IF NOT EXISTS "Flight_providerId_idx" ON "Flight"("providerId");
CREATE INDEX IF NOT EXISTS "Flight_externalId_idx" ON "Flight"("externalId");
CREATE INDEX IF NOT EXISTS "Flight_deletedAt_idx" ON "Flight"("deletedAt");
CREATE INDEX IF NOT EXISTS "FlightSegment_flightId_idx" ON "FlightSegment"("flightId");
CREATE INDEX IF NOT EXISTS "FlightSegment_flightOfferId_idx" ON "FlightSegment"("flightOfferId");
CREATE INDEX IF NOT EXISTS "FlightSegment_deletedAt_idx" ON "FlightSegment"("deletedAt");
CREATE INDEX IF NOT EXISTS "FlightOffer_flightId_idx" ON "FlightOffer"("flightId");
CREATE INDEX IF NOT EXISTS "Hotel_providerId_idx" ON "Hotel"("providerId");
CREATE INDEX IF NOT EXISTS "Hotel_externalId_idx" ON "Hotel"("externalId");
CREATE INDEX IF NOT EXISTS "Hotel_city_idx" ON "Hotel"("city");
CREATE INDEX IF NOT EXISTS "Hotel_deletedAt_idx" ON "Hotel"("deletedAt");
CREATE INDEX IF NOT EXISTS "HotelImage_hotelId_idx" ON "HotelImage"("hotelId");
CREATE INDEX IF NOT EXISTS "HotelImage_deletedAt_idx" ON "HotelImage"("deletedAt");
CREATE INDEX IF NOT EXISTS "HotelAmenity_hotelId_idx" ON "HotelAmenity"("hotelId");
CREATE INDEX IF NOT EXISTS "HotelAmenity_deletedAt_idx" ON "HotelAmenity"("deletedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "HotelAmenity_hotelId_code_key" ON "HotelAmenity"("hotelId", "code");
CREATE INDEX IF NOT EXISTS "HotelRoom_hotelId_idx" ON "HotelRoom"("hotelId");
CREATE INDEX IF NOT EXISTS "HotelRoom_deletedAt_idx" ON "HotelRoom"("deletedAt");
CREATE INDEX IF NOT EXISTS "HotelOffer_hotelId_idx" ON "HotelOffer"("hotelId");
CREATE INDEX IF NOT EXISTS "CarRental_providerId_idx" ON "CarRental"("providerId");
CREATE INDEX IF NOT EXISTS "CarRental_externalId_idx" ON "CarRental"("externalId");
CREATE INDEX IF NOT EXISTS "CarRental_deletedAt_idx" ON "CarRental"("deletedAt");
CREATE INDEX IF NOT EXISTS "CarOffer_carRentalId_idx" ON "CarOffer"("carRentalId");
CREATE INDEX IF NOT EXISTS "Comparison_userId_idx" ON "Comparison"("userId");
CREATE INDEX IF NOT EXISTS "Comparison_kind_idx" ON "Comparison"("kind");
CREATE INDEX IF NOT EXISTS "Comparison_deletedAt_idx" ON "Comparison"("deletedAt");
CREATE INDEX IF NOT EXISTS "ComparisonItem_comparisonId_idx" ON "ComparisonItem"("comparisonId");
CREATE INDEX IF NOT EXISTS "ComparisonItem_hotelId_idx" ON "ComparisonItem"("hotelId");
CREATE INDEX IF NOT EXISTS "ComparisonItem_flightId_idx" ON "ComparisonItem"("flightId");
CREATE INDEX IF NOT EXISTS "ComparisonItem_carRentalId_idx" ON "ComparisonItem"("carRentalId");
CREATE INDEX IF NOT EXISTS "ComparisonItem_deletedAt_idx" ON "ComparisonItem"("deletedAt");

-- Foreign keys (idempotent-ish via DO blocks)
DO $$ BEGIN
  ALTER TABLE "Flight" ADD CONSTRAINT "Flight_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FlightSegment" ADD CONSTRAINT "FlightSegment_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FlightSegment" ADD CONSTRAINT "FlightSegment_flightOfferId_fkey" FOREIGN KEY ("flightOfferId") REFERENCES "FlightOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FlightOffer" ADD CONSTRAINT "FlightOffer_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "HotelImage" ADD CONSTRAINT "HotelImage_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "HotelAmenity" ADD CONSTRAINT "HotelAmenity_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "HotelRoom" ADD CONSTRAINT "HotelRoom_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "HotelOffer" ADD CONSTRAINT "HotelOffer_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CarRental" ADD CONSTRAINT "CarRental_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CarOffer" ADD CONSTRAINT "CarOffer_carRentalId_fkey" FOREIGN KEY ("carRentalId") REFERENCES "CarRental"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ComparisonItem" ADD CONSTRAINT "ComparisonItem_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
