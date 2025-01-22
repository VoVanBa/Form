/*
  Warnings:

  - You are about to drop the `FormSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `BusinessSurveyFeedbackSettings` DROP FOREIGN KEY `BusinessSurveyFeedbackSettings_formSettingId_fkey`;

-- DropForeignKey
ALTER TABLE `FormSettings` DROP FOREIGN KEY `FormSettings_formSettingTypesId_fkey`;

-- DropIndex
DROP INDEX `BusinessSurveyFeedbackSettings_formSettingId_fkey` ON `BusinessSurveyFeedbackSettings`;

-- DropTable
DROP TABLE `FormSettings`;

-- CreateTable
CREATE TABLE `SurveyFeedbackSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `label` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `formSettingTypesId` INTEGER NULL,

    UNIQUE INDEX `SurveyFeedbackSettings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SurveyFeedbackSettings` ADD CONSTRAINT `SurveyFeedbackSettings_formSettingTypesId_fkey` FOREIGN KEY (`formSettingTypesId`) REFERENCES `SettingTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessSurveyFeedbackSettings` ADD CONSTRAINT `BusinessSurveyFeedbackSettings_formSettingId_fkey` FOREIGN KEY (`formSettingId`) REFERENCES `SurveyFeedbackSettings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
