-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageData" TEXT NOT NULL,
    "imageMimeType" TEXT NOT NULL,
    "imageMetadata" JSONB NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "primaryText" TEXT NOT NULL,
    "callToAction" TEXT NOT NULL,
    "alternativeHeadlines" JSONB,
    "keyBenefits" JSONB,
    "toneAnalysis" TEXT,
    "productDescription" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "colorPalette" TEXT,
    "aspectRatio" TEXT NOT NULL,
    "valueProposition" TEXT,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ad_createdAt_idx" ON "Ad"("createdAt");

-- CreateIndex
CREATE INDEX "Ad_industry_idx" ON "Ad"("industry");

-- CreateIndex
CREATE INDEX "Ad_category_idx" ON "Ad"("category");
