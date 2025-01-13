/*
  Warnings:

  - You are about to drop the `FormResponseQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserFormResponse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `FormResponseQuestion` DROP FOREIGN KEY `FormResponseQuestion_answerOptionId_fkey`;

-- DropForeignKey
ALTER TABLE `FormResponseQuestion` DROP FOREIGN KEY `FormResponseQuestion_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `FormResponseQuestion` DROP FOREIGN KEY `FormResponseQuestion_userFormResponseId_fkey`;

-- DropForeignKey
ALTER TABLE `UserFormResponse` DROP FOREIGN KEY `UserFormResponse_formId_fkey`;

-- DropForeignKey
ALTER TABLE `UserFormResponse` DROP FOREIGN KEY `UserFormResponse_userId_fkey`;

-- DropTable
DROP TABLE `FormResponseQuestion`;

-- DropTable
DROP TABLE `UserFormResponse`;

-- CreateTable
CREATE TABLE `UserOnResponse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `guest` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResponseOnQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `useronResponseId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `answerOptionId` INTEGER NULL,
    `answerText` TEXT NULL,
    `ratingValue` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserOnResponse` ADD CONSTRAINT `UserOnResponse_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `SurveyFeedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserOnResponse` ADD CONSTRAINT `UserOnResponse_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponseOnQuestion` ADD CONSTRAINT `ResponseOnQuestion_answerOptionId_fkey` FOREIGN KEY (`answerOptionId`) REFERENCES `AnswerOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponseOnQuestion` ADD CONSTRAINT `ResponseOnQuestion_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponseOnQuestion` ADD CONSTRAINT `ResponseOnQuestion_useronResponseId_fkey` FOREIGN KEY (`useronResponseId`) REFERENCES `UserOnResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
