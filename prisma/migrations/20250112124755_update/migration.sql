/*
  Warnings:

  - Added the required column `formSettingId` to the `BusinessSurveyFeedbackSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BusinessSurveyFeedbackSettings` ADD COLUMN `formSettingId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `BusinessSurveyFeedbackSettings` ADD CONSTRAINT `BusinessSurveyFeedbackSettings_formSettingId_fkey` FOREIGN KEY (`formSettingId`) REFERENCES `FormSettings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
