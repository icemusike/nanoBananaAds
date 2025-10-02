-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idea" TEXT NOT NULL,
    "generatedPrompt" TEXT NOT NULL,
    "industry" TEXT,
    "style" TEXT,
    "aspectRatio" TEXT,
    "metadata" JSONB,
    "usageCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prompt_createdAt_idx" ON "Prompt"("createdAt");

-- CreateIndex
CREATE INDEX "Prompt_industry_idx" ON "Prompt"("industry");

-- CreateIndex
CREATE INDEX "Prompt_style_idx" ON "Prompt"("style");
