-- AlterTable
ALTER TABLE `SurveyFeedback` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `UserOnResponse` ADD COLUMN `completedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Question_id_idx` ON `Question`(`id`);
