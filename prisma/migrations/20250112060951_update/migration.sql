/*
  Warnings:

  - Added the required column `description` to the `BusinessSurveyFeedbackSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `BusinessSurveyFeedbackSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `FormSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `FormSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BusinessSurveyFeedbackSettings` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `label` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `FormSettings` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `label` VARCHAR(191) NOT NULL;
