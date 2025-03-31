/*
  Warnings:

  - You are about to drop the `_AnswerOptionToResponseOnQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_AnswerOptionToResponseOnQuestion` DROP FOREIGN KEY `_AnswerOptionToResponseOnQuestion_A_fkey`;

-- DropForeignKey
ALTER TABLE `_AnswerOptionToResponseOnQuestion` DROP FOREIGN KEY `_AnswerOptionToResponseOnQuestion_B_fkey`;

-- DropTable
DROP TABLE `_AnswerOptionToResponseOnQuestion`;

-- AddForeignKey
ALTER TABLE `ResponseOnQuestion` ADD CONSTRAINT `ResponseOnQuestion_answerOptionId_fkey` FOREIGN KEY (`answerOptionId`) REFERENCES `AnswerOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
