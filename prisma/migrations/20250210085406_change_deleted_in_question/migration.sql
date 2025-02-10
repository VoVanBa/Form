/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Question` DROP COLUMN `isDeleted`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;
