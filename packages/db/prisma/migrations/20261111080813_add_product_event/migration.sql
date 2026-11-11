-- CreateEnum
CREATE TYPE "ProductEventSource" AS ENUM ('client', 'server');

-- CreateTable
CREATE TABLE "ProductEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "properties" JSONB NOT NULL,
    "source" "ProductEventSource" NOT NULL,
    "sessionId" TEXT,
    "occurredAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductEvent_userId_occurredAt_idx" ON "ProductEvent"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "ProductEvent_event_occurredAt_idx" ON "ProductEvent"("event", "occurredAt");

-- AddForeignKey
ALTER TABLE "ProductEvent" ADD CONSTRAINT "ProductEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
