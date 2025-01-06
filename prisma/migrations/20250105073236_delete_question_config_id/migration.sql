/*
  Warnings:

  - You are about to drop the column `questionConfigurationId` on the `Question` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Question_questionConfigurationId_fkey` ON `Question`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `questionConfigurationId`;
