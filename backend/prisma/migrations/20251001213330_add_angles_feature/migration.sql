-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "angleId" TEXT;

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "angleId" TEXT;

-- CreateTable
CREATE TABLE "Angle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessDescription" TEXT NOT NULL,
    "industry" TEXT,
    "targetAudience" TEXT,
    "currentApproach" TEXT,
    "angleName" TEXT NOT NULL,
    "angleDescription" TEXT NOT NULL,
    "whyItWorks" TEXT NOT NULL,
    "targetEmotion" TEXT NOT NULL,
    "exampleHeadline" TEXT NOT NULL,
    "visualStyle" TEXT NOT NULL,
    "copyFramework" TEXT,
    "metadata" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "promptsGenerated" INTEGER NOT NULL DEFAULT 0,
    "adsGenerated" INTEGER NOT NULL DEFAULT 0,
    "performanceRating" DOUBLE PRECISION,
    "performanceNotes" TEXT,

    CONSTRAINT "Angle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Angle_createdAt_idx" ON "Angle"("createdAt");

-- CreateIndex
CREATE INDEX "Angle_industry_idx" ON "Angle"("industry");

-- CreateIndex
CREATE INDEX "Angle_targetEmotion_idx" ON "Angle"("targetEmotion");

-- CreateIndex
CREATE INDEX "Angle_usageCount_idx" ON "Angle"("usageCount");

-- CreateIndex
CREATE INDEX "Ad_angleId_idx" ON "Ad"("angleId");

-- CreateIndex
CREATE INDEX "Prompt_angleId_idx" ON "Prompt"("angleId");

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_angleId_fkey" FOREIGN KEY ("angleId") REFERENCES "Angle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_angleId_fkey" FOREIGN KEY ("angleId") REFERENCES "Angle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
