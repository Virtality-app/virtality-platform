-- CreateEnum
CREATE TYPE "ImmersiveVideoActivity" AS ENUM ('CYCLING', 'WALKING');

-- CreateEnum
CREATE TYPE "ImmersiveVideoCatalogState" AS ENUM ('Draft', 'Uploading', 'Verifying', 'Published', 'Republishing', 'Unpublished');

-- CreateEnum
CREATE TYPE "DeviceVideoStatus" AS ENUM ('downloading', 'paused', 'ready', 'failed');

-- CreateEnum
CREATE TYPE "DeviceVideoFailureReason" AS ENUM ('insufficient_storage', 'network', 'checksum_mismatch', 'cancelled', 'url_expired', 'unavailable');

-- CreateTable
CREATE TABLE "ImmersiveVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "activity" "ImmersiveVideoActivity" NOT NULL DEFAULT 'CYCLING',
    "description" TEXT,
    "state" "ImmersiveVideoCatalogState" NOT NULL DEFAULT 'Draft',
    "priorState" "ImmersiveVideoCatalogState",
    "version" INTEGER NOT NULL DEFAULT 0,
    "objectKey" TEXT,
    "sizeBytes" BIGINT,
    "checksum" TEXT,
    "durationSec" INTEGER,
    "filename" TEXT,
    "thumbnailKey" TEXT,
    "uploadId" TEXT,
    "uploadObjectKey" TEXT,
    "uploadFilename" TEXT,
    "uploadSizeBytes" BIGINT,
    "uploadDurationSec" INTEGER,
    "verifyFailedAt" TIMESTAMP(6),
    "publishedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ImmersiveVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImmersiveVideoRetiredObject" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "objectKey" TEXT NOT NULL,
    "retiredAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImmersiveVideoRetiredObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceVideoReport" (
    "deviceId" TEXT NOT NULL,
    "freeBytes" BIGINT NOT NULL,
    "reportedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "DeviceVideoReport_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "DeviceVideo" (
    "deviceId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "status" "DeviceVideoStatus" NOT NULL,
    "version" INTEGER,
    "bytesDownloaded" BIGINT,
    "sizeBytes" BIGINT,
    "reason" "DeviceVideoFailureReason",

    CONSTRAINT "DeviceVideo_pkey" PRIMARY KEY ("deviceId","videoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImmersiveVideo_objectKey_key" ON "ImmersiveVideo"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "ImmersiveVideo_uploadId_key" ON "ImmersiveVideo"("uploadId");

-- CreateIndex
CREATE INDEX "ImmersiveVideo_state_idx" ON "ImmersiveVideo"("state");

-- CreateIndex
CREATE INDEX "ImmersiveVideo_updatedAt_idx" ON "ImmersiveVideo"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImmersiveVideoRetiredObject_objectKey_key" ON "ImmersiveVideoRetiredObject"("objectKey");

-- CreateIndex
CREATE UNIQUE INDEX "ImmersiveVideoRetiredObject_videoId_version_key" ON "ImmersiveVideoRetiredObject"("videoId", "version");

-- CreateIndex
CREATE INDEX "DeviceVideo_videoId_version_idx" ON "DeviceVideo"("videoId", "version");

-- AddForeignKey
ALTER TABLE "ImmersiveVideoRetiredObject" ADD CONSTRAINT "ImmersiveVideoRetiredObject_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "ImmersiveVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceVideo" ADD CONSTRAINT "DeviceVideo_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "DeviceVideoReport"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;
