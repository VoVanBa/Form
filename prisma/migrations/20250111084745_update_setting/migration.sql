/*
  Warnings:

  - You are about to drop the column `formId` on the `FormSettings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `FormSettings` DROP FOREIGN KEY `FormSettings_formId_fkey`;

-- DropIndex
DROP INDEX `FormSettings_formId_key_key` ON `FormSettings`;

-- AlterTable
ALTER TABLE `BusinessSurveyFeedbackSettings` ADD COLUMN `isEnabled` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `FormSettings` DROP COLUMN `formId`;
