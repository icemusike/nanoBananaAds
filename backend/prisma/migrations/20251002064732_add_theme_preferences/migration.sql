-- AlterTable
ALTER TABLE "User" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'solar-dusk',
ADD COLUMN     "themeMode" TEXT NOT NULL DEFAULT 'dark';
