/*
  Warnings:

  - You are about to drop the `QuestionCondition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `QuestionCondition` DROP FOREIGN KEY `QuestionCondition_sourceQuestionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionCondition` DROP FOREIGN KEY `QuestionCondition_targetQuestionId_fkey`;

-- DropTable
DROP TABLE `QuestionCondition`;

-- CreateTable
CREATE TABLE `SurveyFeedbackEnding` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `surveyId` INTEGER NOT NULL,
    `message` VARCHAR(191) NOT NULL DEFAULT 'Cảm ơn quý khách đã trả lời khảo sát',
    `redirectUrl` VARCHAR(191) NULL,
    `mediaId` INTEGER NULL,

    UNIQUE INDEX `SurveyFeedbackEnding_surveyId_key`(`surveyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SurveyFeedbackEnding` ADD CONSTRAINT `SurveyFeedbackEnding_surveyId_fkey` FOREIGN KEY (`surveyId`) REFERENCES `SurveyFeedback`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyFeedbackEnding` ADD CONSTRAINT `SurveyFeedbackEnding_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
