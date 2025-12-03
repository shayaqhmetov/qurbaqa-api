/*
  Warnings:

  - The `entityType` column on the `Translation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TranslationEntityType" AS ENUM ('MODULE');

-- AlterTable
ALTER TABLE "Translation" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "TranslationEntityType" NOT NULL DEFAULT 'MODULE';

-- CreateIndex
CREATE INDEX "idx_trans_entity" ON "Translation"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "idx_trans_entity_field_locale" ON "Translation"("entityType", "entityId", "field", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_entityType_entityId_field_locale_key" ON "Translation"("entityType", "entityId", "field", "locale");
