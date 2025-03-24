-- DropForeignKey
ALTER TABLE `SurveyFeedbackEnding` DROP FOREIGN KEY `SurveyFeedbackEnding_mediaId_fkey`;

-- DropIndex
DROP INDEX `SurveyFeedbackEnding_mediaId_fkey` ON `SurveyFeedbackEnding`;

-- AlterTable
ALTER TABLE `QuestionLogic` ADD COLUMN `actionType` ENUM('JUMP', 'SHOW', 'HIDE') NOT NULL DEFAULT 'JUMP';

-- CreateIndex
CREATE INDEX `Question_deletedAt_idx` ON `Question`(`deletedAt`);

-- CreateIndex
CREATE INDEX `QuestionLogic_actionType_idx` ON `QuestionLogic`(`actionType`);

-- AddForeignKey
ALTER TABLE `SurveyFeedbackEnding` ADD CONSTRAINT `SurveyFeedbackEnding_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionLogic` ADD CONSTRAINT `QuestionLogic_jumpToQuestionId_fkey` FOREIGN KEY (`jumpToQuestionId`) REFERENCES `Question`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
