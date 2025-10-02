-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultBrandId" TEXT;

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tagline" TEXT,
    "logo" TEXT,
    "logoMimeType" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "colorPalette" TEXT,
    "industry" TEXT,
    "targetAudience" TEXT,
    "brandVoice" TEXT,
    "tone" TEXT NOT NULL DEFAULT 'professional yet approachable',
    "valueProposition" TEXT,
    "keyMessages" JSONB,
    "brandGuidelines" TEXT,
    "websiteUrl" TEXT,
    "socialMediaLinks" JSONB,
    "metadata" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Brand_userId_idx" ON "Brand"("userId");

-- CreateIndex
CREATE INDEX "Brand_createdAt_idx" ON "Brand"("createdAt");

-- CreateIndex
CREATE INDEX "Brand_industry_idx" ON "Brand"("industry");

-- CreateIndex
CREATE INDEX "Brand_name_idx" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "User_defaultBrandId_idx" ON "User"("defaultBrandId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultBrandId_fkey" FOREIGN KEY ("defaultBrandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
