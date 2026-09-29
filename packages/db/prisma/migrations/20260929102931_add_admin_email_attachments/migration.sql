-- CreateTable
CREATE TABLE "AdminEmailAttachment" (
    "id" TEXT NOT NULL,
    "draftId" TEXT,
    "sentRecordId" TEXT,
    "objectKey" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminEmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminEmailAttachment_objectKey_key" ON "AdminEmailAttachment"("objectKey");

-- CreateIndex
CREATE INDEX "AdminEmailAttachment_draftId_idx" ON "AdminEmailAttachment"("draftId");

-- CreateIndex
CREATE INDEX "AdminEmailAttachment_sentRecordId_idx" ON "AdminEmailAttachment"("sentRecordId");

-- AddForeignKey
ALTER TABLE "AdminEmailAttachment" ADD CONSTRAINT "AdminEmailAttachment_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "AdminEmailDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminEmailAttachment" ADD CONSTRAINT "AdminEmailAttachment_sentRecordId_fkey" FOREIGN KEY ("sentRecordId") REFERENCES "AdminEmailSentRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

