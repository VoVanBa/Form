/*
  Warnings:

  - You are about to drop the column `sentAt` on the `ResponseOnQuestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ResponseOnQuestion` DROP COLUMN `sentAt`;

-- AlterTable
ALTER TABLE `UserOnResponse` ADD COLUMN `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
