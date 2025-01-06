/*
  Warnings:

  - You are about to drop the column `questionId` on the `QuestionConfiguration` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `QuestionConfiguration` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_questionConfigurationId_fkey`;

-- DropIndex
DROP INDEX `QuestionConfiguration_questionId_key` ON `QuestionConfiguration`;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `businessQuestionConfigurationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `QuestionConfiguration` DROP COLUMN `questionId`;

-- CreateTable
CREATE TABLE `BusinessQuestionConfiguration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NULL,
    `key` VARCHAR(191) NOT NULL,
    `settings` JSON NOT NULL,

    UNIQUE INDEX `BusinessQuestionConfiguration_questionId_key`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `QuestionConfiguration_key_key` ON `QuestionConfiguration`(`key`);

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_businessQuestionConfigurationId_fkey` FOREIGN KEY (`businessQuestionConfigurationId`) REFERENCES `BusinessQuestionConfiguration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
