/*
  Warnings:

  - The primary key for the `Translation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `entity` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `Translation` table. All the data in the column will be lost.
  - The `id` column on the `Translation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `entityType` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Translation_locale_idx";

-- DropIndex
DROP INDEX "Translation_locale_key_key";

-- AlterTable
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "entity",
DROP COLUMN "key",
ADD COLUMN     "entityType" TEXT NOT NULL,
ADD COLUMN     "field" TEXT NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ALTER COLUMN "locale" SET DATA TYPE TEXT,
DROP COLUMN "entityId",
ADD COLUMN     "entityId" BIGINT NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Translation_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "idx_trans_entity" ON "Translation"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "idx_trans_entity_field_locale" ON "Translation"("entityType", "entityId", "field", "locale");
