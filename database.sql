-- ==========================================================
-- PackersMart Platform — Database Schema (PostgreSQL)
-- ==========================================================

-- Drop existing tables and types if any
DROP TABLE IF EXISTS "LeadCompanyMatch" CASCADE;
DROP TABLE IF EXISTS "OtpVerification" CASCADE;
DROP TABLE IF EXISTS "Company" CASCADE;
DROP TABLE IF EXISTS "Lead" CASCADE;

DROP TYPE IF EXISTS "LeadStatus";
DROP TYPE IF EXISTS "LeadQuality";
DROP TYPE IF EXISTS "CompanyStatus";

-- Enums
CREATE TYPE "LeadStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAKE', 'DUPLICATE', 'RE_ATTEMPT');
CREATE TYPE "LeadQuality" AS ENUM ('HOT', 'WARM', 'COLD');
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- 1. Leads Table
CREATE TABLE "Lead" (
    "id" SERIAL PRIMARY KEY,
    "customerName" VARCHAR(255) NOT NULL,
    "mobile" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "pickupCity" VARCHAR(100) NOT NULL,
    "destinationCity" VARCHAR(100) NOT NULL,
    "serviceType" VARCHAR(100) NOT NULL,
    "movingDate" TIMESTAMP(3) NOT NULL,
    "additionalRequirements" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'PENDING',
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "leadQuality" "LeadQuality",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. OTP Verifications Table
CREATE TABLE "OtpVerification" (
    "id" SERIAL PRIMARY KEY,
    "leadId" INTEGER NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
    "otp" VARCHAR(10) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "OtpVerification_leadId_idx" ON "OtpVerification"("leadId");

-- 3. Logistics Companies Table
CREATE TABLE "Company" (
    "id" SERIAL PRIMARY KEY,
    "companyName" VARCHAR(255) NOT NULL,
    "coverage" TEXT[] NOT NULL,
    "serviceTypes" TEXT[] NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Lead Company Matches Table
CREATE TABLE "LeadCompanyMatch" (
    "id" SERIAL PRIMARY KEY,
    "leadId" INTEGER NOT NULL REFERENCES "Lead"("id") ON DELETE CASCADE,
    "companyId" INTEGER NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
    "matchScore" INTEGER NOT NULL,
    "notificationStatus" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadCompanyMatch_leadId_companyId_unique" UNIQUE ("leadId", "companyId")
);

CREATE INDEX "LeadCompanyMatch_leadId_idx" ON "LeadCompanyMatch"("leadId");
CREATE INDEX "LeadCompanyMatch_companyId_idx" ON "LeadCompanyMatch"("companyId");

-- ==========================================================
-- Sample Seed Data for Logistics Companies
-- ==========================================================
INSERT INTO "Company" ("companyName", "coverage", "serviceTypes", "rating", "status") VALUES
('Delhi Movers', ARRAY['Delhi', 'Noida', 'Gurgaon', 'Ghaziabad', 'Mumbai'], ARRAY['Household', 'Office'], 4.5, 'ACTIVE'),
('NorthStar Packers', ARRAY['Delhi', 'Chandigarh', 'Jaipur', 'Noida'], ARRAY['Household', 'Vehicle'], 4.3, 'ACTIVE'),
('QuickShift Logistics', ARRAY['Delhi', 'Mumbai', 'Pune', 'Bangalore'], ARRAY['Household', 'Office', 'Vehicle'], 4.2, 'ACTIVE'),
('SafeMove Packers', ARRAY['Mumbai', 'Pune', 'Nashik', 'Delhi'], ARRAY['Household', 'Office'], 4.6, 'ACTIVE'),
('Urban Relocation', ARRAY['Bangalore', 'Hyderabad', 'Chennai', 'Pune'], ARRAY['Household', 'Office'], 4.1, 'ACTIVE'),
('Express Movers', ARRAY['Delhi', 'Noida', 'Lucknow', 'Kanpur'], ARRAY['Household'], 4.0, 'ACTIVE'),
('Reliable Shifting', ARRAY['Mumbai', 'Ahmedabad', 'Surat', 'Pune'], ARRAY['Household', 'Vehicle'], 4.4, 'ACTIVE'),
('PrimeMove Logistics', ARRAY['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad'], ARRAY['Office', 'Household'], 4.7, 'ACTIVE');
