-- AlterTable Vendor: KYC fields
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "kycStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "documentType" TEXT;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "documentUrl" TEXT;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "documentVerifiedAt" TIMESTAMP(3);
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "businessAddressVerifiedAt" TIMESTAMP(3);
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "bankAccountVerifiedAt" TIMESTAMP(3);

-- AlterTable ActiveSession: device fingerprint
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "deviceFingerprintHash" TEXT;

-- CreateTable KnownDevice
CREATE TABLE IF NOT EXISTS "known_devices" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "name" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "known_devices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "known_devices_userId_fingerprintHash_key" ON "known_devices"("userId", "fingerprintHash");
CREATE INDEX IF NOT EXISTS "known_devices_userId_idx" ON "known_devices"("userId");
ALTER TABLE "known_devices" ADD CONSTRAINT "known_devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable VendorApiKey
CREATE TABLE IF NOT EXISTS "vendor_api_keys" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_api_keys_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "vendor_api_keys_vendorId_idx" ON "vendor_api_keys"("vendorId");
CREATE INDEX IF NOT EXISTS "vendor_api_keys_keyHash_idx" ON "vendor_api_keys"("keyHash");
ALTER TABLE "vendor_api_keys" ADD CONSTRAINT "vendor_api_keys_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable VendorKycReview
CREATE TABLE IF NOT EXISTS "vendor_kyc_reviews" (
    "id" SERIAL NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "reviewedBy" INTEGER,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_kyc_reviews_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "vendor_kyc_reviews_vendorId_idx" ON "vendor_kyc_reviews"("vendorId");
ALTER TABLE "vendor_kyc_reviews" ADD CONSTRAINT "vendor_kyc_reviews_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
