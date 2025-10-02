-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "company" TEXT,
    "geminiApiKey" TEXT,
    "openaiApiKey" TEXT,
    "preferredImageModel" TEXT NOT NULL DEFAULT 'gemini',
    "imageQuality" TEXT NOT NULL DEFAULT 'standard',
    "defaultIndustry" TEXT,
    "defaultTone" TEXT NOT NULL DEFAULT 'professional yet approachable',
    "defaultAspectRatio" TEXT NOT NULL DEFAULT 'square',
    "adsGenerated" INTEGER NOT NULL DEFAULT 0,
    "promptsGenerated" INTEGER NOT NULL DEFAULT 0,
    "anglesGenerated" INTEGER NOT NULL DEFAULT 0,
    "settings" JSONB,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
