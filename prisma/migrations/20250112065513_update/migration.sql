/*
  Warnings:

  - You are about to drop the column `description` on the `BusinessSurveyFeedbackSettings` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `BusinessSurveyFeedbackSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `BusinessSurveyFeedbackSettings` DROP COLUMN `description`,
    DROP COLUMN `label`;
