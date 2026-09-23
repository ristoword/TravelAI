-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'PRICE_CHANGED', 'PAYMENT_PENDING', 'PAID', 'BOOKING_PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'REQUIRES_ACTION', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PRICE_CHANGED', 'PAYMENT_PENDING', 'PAID', 'BOOKING_PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TripItemType" AS ENUM ('FLIGHT', 'HOTEL', 'CAR', 'ACTIVITY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'IN_APP', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ProviderKind" AS ENUM ('FLIGHT', 'HOTEL', 'CAR', 'ACTIVITY', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'it',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Traveler" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Traveler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "destination" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripTraveler" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripTraveler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tripId" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "adults" INTEGER NOT NULL DEFAULT 1,
    "cabinClass" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FlightSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightOffer" (
    "id" TEXT NOT NULL,
    "flightSearchId" TEXT NOT NULL,
    "providerId" TEXT,
    "externalId" TEXT,
    "airline" TEXT,
    "priceAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawPayload" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FlightOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flightOfferId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "pnr" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FlightBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tripId" TEXT,
    "location" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "rooms" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HotelSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelOffer" (
    "id" TEXT NOT NULL,
    "hotelSearchId" TEXT NOT NULL,
    "providerId" TEXT,
    "externalId" TEXT,
    "hotelName" TEXT,
    "priceAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawPayload" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HotelOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelOfferId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationCode" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tripId" TEXT,
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT,
    "pickupAt" TIMESTAMP(3) NOT NULL,
    "dropoffAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CarSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarOffer" (
    "id" TEXT NOT NULL,
    "carSearchId" TEXT NOT NULL,
    "providerId" TEXT,
    "externalId" TEXT,
    "vendorName" TEXT,
    "priceAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawPayload" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CarOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carOfferId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationCode" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CarBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tripId" TEXT,
    "location" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3),
    "adults" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActivitySearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityOffer" (
    "id" TEXT NOT NULL,
    "activitySearchId" TEXT NOT NULL,
    "providerId" TEXT,
    "externalId" TEXT,
    "title" TEXT,
    "priceAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "rawPayload" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActivityOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityOfferId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "confirmationCode" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActivityBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripItem" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "type" "TripItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "flightBookingId" TEXT,
    "hotelBookingId" TEXT,
    "carBookingId" TEXT,
    "activityBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TripItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Itinerary" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryDay" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "title" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ItineraryDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItineraryItem" (
    "id" TEXT NOT NULL,
    "itineraryDayId" TEXT NOT NULL,
    "tripItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ItineraryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ProviderKind" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderRequest" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderResponse" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerRequestId" TEXT,
    "statusCode" INTEGER,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "subject" TEXT,
    "body" TEXT,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT,
    "label" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Traveler_userId_idx" ON "Traveler"("userId");

-- CreateIndex
CREATE INDEX "Traveler_deletedAt_idx" ON "Traveler"("deletedAt");

-- CreateIndex
CREATE INDEX "Trip_userId_idx" ON "Trip"("userId");

-- CreateIndex
CREATE INDEX "Trip_deletedAt_idx" ON "Trip"("deletedAt");

-- CreateIndex
CREATE INDEX "TripTraveler_tripId_idx" ON "TripTraveler"("tripId");

-- CreateIndex
CREATE INDEX "TripTraveler_travelerId_idx" ON "TripTraveler"("travelerId");

-- CreateIndex
CREATE UNIQUE INDEX "TripTraveler_tripId_travelerId_key" ON "TripTraveler"("tripId", "travelerId");

-- CreateIndex
CREATE INDEX "FlightSearch_tripId_idx" ON "FlightSearch"("tripId");

-- CreateIndex
CREATE INDEX "FlightSearch_createdAt_idx" ON "FlightSearch"("createdAt");

-- CreateIndex
CREATE INDEX "FlightSearch_deletedAt_idx" ON "FlightSearch"("deletedAt");

-- CreateIndex
CREATE INDEX "FlightOffer_flightSearchId_idx" ON "FlightOffer"("flightSearchId");

-- CreateIndex
CREATE INDEX "FlightOffer_providerId_idx" ON "FlightOffer"("providerId");

-- CreateIndex
CREATE INDEX "FlightOffer_deletedAt_idx" ON "FlightOffer"("deletedAt");

-- CreateIndex
CREATE INDEX "FlightBooking_userId_idx" ON "FlightBooking"("userId");

-- CreateIndex
CREATE INDEX "FlightBooking_flightOfferId_idx" ON "FlightBooking"("flightOfferId");

-- CreateIndex
CREATE INDEX "FlightBooking_orderId_idx" ON "FlightBooking"("orderId");

-- CreateIndex
CREATE INDEX "FlightBooking_status_idx" ON "FlightBooking"("status");

-- CreateIndex
CREATE INDEX "FlightBooking_deletedAt_idx" ON "FlightBooking"("deletedAt");

-- CreateIndex
CREATE INDEX "HotelSearch_tripId_idx" ON "HotelSearch"("tripId");

-- CreateIndex
CREATE INDEX "HotelSearch_createdAt_idx" ON "HotelSearch"("createdAt");

-- CreateIndex
CREATE INDEX "HotelSearch_deletedAt_idx" ON "HotelSearch"("deletedAt");

-- CreateIndex
CREATE INDEX "HotelOffer_hotelSearchId_idx" ON "HotelOffer"("hotelSearchId");

-- CreateIndex
CREATE INDEX "HotelOffer_providerId_idx" ON "HotelOffer"("providerId");

-- CreateIndex
CREATE INDEX "HotelOffer_deletedAt_idx" ON "HotelOffer"("deletedAt");

-- CreateIndex
CREATE INDEX "HotelBooking_userId_idx" ON "HotelBooking"("userId");

-- CreateIndex
CREATE INDEX "HotelBooking_hotelOfferId_idx" ON "HotelBooking"("hotelOfferId");

-- CreateIndex
CREATE INDEX "HotelBooking_orderId_idx" ON "HotelBooking"("orderId");

-- CreateIndex
CREATE INDEX "HotelBooking_status_idx" ON "HotelBooking"("status");

-- CreateIndex
CREATE INDEX "HotelBooking_deletedAt_idx" ON "HotelBooking"("deletedAt");

-- CreateIndex
CREATE INDEX "CarSearch_tripId_idx" ON "CarSearch"("tripId");

-- CreateIndex
CREATE INDEX "CarSearch_createdAt_idx" ON "CarSearch"("createdAt");

-- CreateIndex
CREATE INDEX "CarSearch_deletedAt_idx" ON "CarSearch"("deletedAt");

-- CreateIndex
CREATE INDEX "CarOffer_carSearchId_idx" ON "CarOffer"("carSearchId");

-- CreateIndex
CREATE INDEX "CarOffer_providerId_idx" ON "CarOffer"("providerId");

-- CreateIndex
CREATE INDEX "CarOffer_deletedAt_idx" ON "CarOffer"("deletedAt");

-- CreateIndex
CREATE INDEX "CarBooking_userId_idx" ON "CarBooking"("userId");

-- CreateIndex
CREATE INDEX "CarBooking_carOfferId_idx" ON "CarBooking"("carOfferId");

-- CreateIndex
CREATE INDEX "CarBooking_orderId_idx" ON "CarBooking"("orderId");

-- CreateIndex
CREATE INDEX "CarBooking_status_idx" ON "CarBooking"("status");

-- CreateIndex
CREATE INDEX "CarBooking_deletedAt_idx" ON "CarBooking"("deletedAt");

-- CreateIndex
CREATE INDEX "ActivitySearch_tripId_idx" ON "ActivitySearch"("tripId");

-- CreateIndex
CREATE INDEX "ActivitySearch_createdAt_idx" ON "ActivitySearch"("createdAt");

-- CreateIndex
CREATE INDEX "ActivitySearch_deletedAt_idx" ON "ActivitySearch"("deletedAt");

-- CreateIndex
CREATE INDEX "ActivityOffer_activitySearchId_idx" ON "ActivityOffer"("activitySearchId");

-- CreateIndex
CREATE INDEX "ActivityOffer_providerId_idx" ON "ActivityOffer"("providerId");

-- CreateIndex
CREATE INDEX "ActivityOffer_deletedAt_idx" ON "ActivityOffer"("deletedAt");

-- CreateIndex
CREATE INDEX "ActivityBooking_userId_idx" ON "ActivityBooking"("userId");

-- CreateIndex
CREATE INDEX "ActivityBooking_activityOfferId_idx" ON "ActivityBooking"("activityOfferId");

-- CreateIndex
CREATE INDEX "ActivityBooking_orderId_idx" ON "ActivityBooking"("orderId");

-- CreateIndex
CREATE INDEX "ActivityBooking_status_idx" ON "ActivityBooking"("status");

-- CreateIndex
CREATE INDEX "ActivityBooking_deletedAt_idx" ON "ActivityBooking"("deletedAt");

-- CreateIndex
CREATE INDEX "TripItem_tripId_idx" ON "TripItem"("tripId");

-- CreateIndex
CREATE INDEX "TripItem_type_idx" ON "TripItem"("type");

-- CreateIndex
CREATE INDEX "TripItem_deletedAt_idx" ON "TripItem"("deletedAt");

-- CreateIndex
CREATE INDEX "Itinerary_tripId_idx" ON "Itinerary"("tripId");

-- CreateIndex
CREATE INDEX "Itinerary_deletedAt_idx" ON "Itinerary"("deletedAt");

-- CreateIndex
CREATE INDEX "ItineraryDay_itineraryId_idx" ON "ItineraryDay"("itineraryId");

-- CreateIndex
CREATE INDEX "ItineraryDay_deletedAt_idx" ON "ItineraryDay"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryDay_itineraryId_dayNumber_key" ON "ItineraryDay"("itineraryId", "dayNumber");

-- CreateIndex
CREATE INDEX "ItineraryItem_itineraryDayId_idx" ON "ItineraryItem"("itineraryDayId");

-- CreateIndex
CREATE INDEX "ItineraryItem_tripItemId_idx" ON "ItineraryItem"("tripItemId");

-- CreateIndex
CREATE INDEX "ItineraryItem_deletedAt_idx" ON "ItineraryItem"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_tripId_idx" ON "Order"("tripId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_deletedAt_idx" ON "Order"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_code_key" ON "Provider"("code");

-- CreateIndex
CREATE INDEX "Provider_kind_idx" ON "Provider"("kind");

-- CreateIndex
CREATE INDEX "Provider_isActive_idx" ON "Provider"("isActive");

-- CreateIndex
CREATE INDEX "Provider_deletedAt_idx" ON "Provider"("deletedAt");

-- CreateIndex
CREATE INDEX "ProviderRequest_providerId_idx" ON "ProviderRequest"("providerId");

-- CreateIndex
CREATE INDEX "ProviderRequest_createdAt_idx" ON "ProviderRequest"("createdAt");

-- CreateIndex
CREATE INDEX "ProviderResponse_providerId_idx" ON "ProviderResponse"("providerId");

-- CreateIndex
CREATE INDEX "ProviderResponse_providerRequestId_idx" ON "ProviderResponse"("providerRequestId");

-- CreateIndex
CREATE INDEX "ProviderResponse_createdAt_idx" ON "ProviderResponse"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_deletedAt_idx" ON "Notification"("deletedAt");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_tripId_idx" ON "Favorite"("tripId");

-- CreateIndex
CREATE INDEX "Favorite_deletedAt_idx" ON "Favorite"("deletedAt");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_targetType_targetId_idx" ON "Review"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Review_deletedAt_idx" ON "Review"("deletedAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traveler" ADD CONSTRAINT "Traveler_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripTraveler" ADD CONSTRAINT "TripTraveler_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripTraveler" ADD CONSTRAINT "TripTraveler_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "Traveler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightSearch" ADD CONSTRAINT "FlightSearch_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightOffer" ADD CONSTRAINT "FlightOffer_flightSearchId_fkey" FOREIGN KEY ("flightSearchId") REFERENCES "FlightSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightOffer" ADD CONSTRAINT "FlightOffer_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_flightOfferId_fkey" FOREIGN KEY ("flightOfferId") REFERENCES "FlightOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelSearch" ADD CONSTRAINT "HotelSearch_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelOffer" ADD CONSTRAINT "HotelOffer_hotelSearchId_fkey" FOREIGN KEY ("hotelSearchId") REFERENCES "HotelSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelOffer" ADD CONSTRAINT "HotelOffer_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_hotelOfferId_fkey" FOREIGN KEY ("hotelOfferId") REFERENCES "HotelOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarSearch" ADD CONSTRAINT "CarSearch_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOffer" ADD CONSTRAINT "CarOffer_carSearchId_fkey" FOREIGN KEY ("carSearchId") REFERENCES "CarSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarOffer" ADD CONSTRAINT "CarOffer_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarBooking" ADD CONSTRAINT "CarBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarBooking" ADD CONSTRAINT "CarBooking_carOfferId_fkey" FOREIGN KEY ("carOfferId") REFERENCES "CarOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarBooking" ADD CONSTRAINT "CarBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySearch" ADD CONSTRAINT "ActivitySearch_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOffer" ADD CONSTRAINT "ActivityOffer_activitySearchId_fkey" FOREIGN KEY ("activitySearchId") REFERENCES "ActivitySearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityOffer" ADD CONSTRAINT "ActivityOffer_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityBooking" ADD CONSTRAINT "ActivityBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityBooking" ADD CONSTRAINT "ActivityBooking_activityOfferId_fkey" FOREIGN KEY ("activityOfferId") REFERENCES "ActivityOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityBooking" ADD CONSTRAINT "ActivityBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_flightBookingId_fkey" FOREIGN KEY ("flightBookingId") REFERENCES "FlightBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_hotelBookingId_fkey" FOREIGN KEY ("hotelBookingId") REFERENCES "HotelBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_carBookingId_fkey" FOREIGN KEY ("carBookingId") REFERENCES "CarBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripItem" ADD CONSTRAINT "TripItem_activityBookingId_fkey" FOREIGN KEY ("activityBookingId") REFERENCES "ActivityBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Itinerary" ADD CONSTRAINT "Itinerary_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryDay" ADD CONSTRAINT "ItineraryDay_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "Itinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_itineraryDayId_fkey" FOREIGN KEY ("itineraryDayId") REFERENCES "ItineraryDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_tripItemId_fkey" FOREIGN KEY ("tripItemId") REFERENCES "TripItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderRequest" ADD CONSTRAINT "ProviderRequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderResponse" ADD CONSTRAINT "ProviderResponse_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderResponse" ADD CONSTRAINT "ProviderResponse_providerRequestId_fkey" FOREIGN KEY ("providerRequestId") REFERENCES "ProviderRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

