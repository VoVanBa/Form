/*
  Warnings:

  - You are about to drop the column `surveyId` on the `SurveyFeedbackEnding` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[formId]` on the table `SurveyFeedbackEnding` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `formId` to the `SurveyFeedbackEnding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `SurveyFeedbackEnding` DROP FOREIGN KEY `SurveyFeedbackEnding_surveyId_fkey`;

-- DropIndex
DROP INDEX `SurveyFeedbackEnding_surveyId_key` ON `SurveyFeedbackEnding`;

-- AlterTable
ALTER TABLE `SurveyFeedbackEnding` DROP COLUMN `surveyId`,
    ADD COLUMN `formId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SurveyFeedbackEnding_formId_key` ON `SurveyFeedbackEnding`(`formId`);

-- AddForeignKey
ALTER TABLE `SurveyFeedbackEnding` ADD CONSTRAINT `SurveyFeedbackEnding_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `SurveyFeedback`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
