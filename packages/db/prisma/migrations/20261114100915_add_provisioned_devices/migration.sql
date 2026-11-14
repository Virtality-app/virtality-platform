-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "accessCodeId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Device_accessCodeId_idx" ON "Device"("accessCodeId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_accessCodeId_fkey" FOREIGN KEY ("accessCodeId") REFERENCES "TrialRedeemCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
