-- CreateEnum
CREATE TYPE "PatientSessionKind" AS ENUM ('EXERCISE', 'IMMERSIVE_VIDEO');

-- CreateEnum
CREATE TYPE "ImmersiveSessionEndReason" AS ENUM ('ENDED', 'STOPPED', 'TIME_LIMIT', 'INTERRUPTED');

-- AlterTable
ALTER TABLE "PatientSession" ADD COLUMN     "kind" "PatientSessionKind" NOT NULL DEFAULT 'EXERCISE';

-- CreateTable
CREATE TABLE "SessionImmersiveVideo" (
    "id" TEXT NOT NULL,
    "patientSessionId" TEXT NOT NULL,
    "immersiveVideoId" TEXT,
    "videoTitle" TEXT NOT NULL,
    "activity" "ImmersiveVideoActivity" NOT NULL,
    "videoDurationSec" INTEGER,
    "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(6),
    "lastPositionSec" INTEGER,
    "endReason" "ImmersiveSessionEndReason",

    CONSTRAINT "SessionImmersiveVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionImmersiveVideo_patientSessionId_key" ON "SessionImmersiveVideo"("patientSessionId");

-- CreateIndex
CREATE INDEX "SessionImmersiveVideo_immersiveVideoId_idx" ON "SessionImmersiveVideo"("immersiveVideoId");

-- AddForeignKey
ALTER TABLE "SessionImmersiveVideo" ADD CONSTRAINT "SessionImmersiveVideo_patientSessionId_fkey" FOREIGN KEY ("patientSessionId") REFERENCES "PatientSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionImmersiveVideo" ADD CONSTRAINT "SessionImmersiveVideo_immersiveVideoId_fkey" FOREIGN KEY ("immersiveVideoId") REFERENCES "ImmersiveVideo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
