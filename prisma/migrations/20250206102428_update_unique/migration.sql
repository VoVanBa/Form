-- DropForeignKey
ALTER TABLE `BusinessQuestionConfiguration` DROP FOREIGN KEY `BusinessQuestionConfiguration_formId_fkey`;

-- DropIndex
DROP INDEX `BusinessQuestionConfiguration_formId_key` ON `BusinessQuestionConfiguration`;

-- AddForeignKey
ALTER TABLE `ResponseOnQuestion` ADD CONSTRAINT `ResponseOnQuestion_answerOptionId_fkey` FOREIGN KEY (`answerOptionId`) REFERENCES `AnswerOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
