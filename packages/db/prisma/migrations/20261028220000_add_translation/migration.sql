CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Translation_locale_namespace_key_key" ON "Translation"("locale", "namespace", "key");

