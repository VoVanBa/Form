-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(1024) NOT NULL,
    `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL,
    `googleId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Business` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `Business_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SurveyFeedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isOpen` BOOLEAN NOT NULL DEFAULT true,
    `type` ENUM('SURVEY', 'FEEDBACK') NOT NULL,
    `allowAnonymous` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('DRAFT', 'PUBLISHED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `businessId` INTEGER NOT NULL,

    INDEX `SurveyFeedback_businessId_fkey`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserFormResponse` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `guest` JSON NULL,

    INDEX `UserFormResponse_formId_fkey`(`formId`),
    INDEX `UserFormResponse_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FormResponseQuestion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userFormResponseId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `answerOptionId` INTEGER NULL,
    `answerText` TEXT NULL,
    `ratingValue` INTEGER NULL,

    INDEX `FormResponseQuestion_answerOptionId_fkey`(`answerOptionId`),
    INDEX `FormResponseQuestion_questionId_fkey`(`questionId`),
    INDEX `FormResponseQuestion_userFormResponseId_fkey`(`userFormResponseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SettingTypes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `defaultValue` JSON NULL,

    UNIQUE INDEX `SettingTypes_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FormSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `formId` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `formSettingTypesId` INTEGER NULL,

    INDEX `FormSettings_formSettingTypesId_fkey`(`formSettingTypesId`),
    UNIQUE INDEX `FormSettings_formId_key_key`(`formId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessSurveyFeedbackSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `businessId` INTEGER NOT NULL,
    `formId` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,

    INDEX `BusinessSurveyFeedbackSettings_formId_fkey`(`formId`),
    UNIQUE INDEX `BusinessSurveyFeedbackSettings_businessId_formId_key_key`(`businessId`, `formId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `headline` VARCHAR(191) NOT NULL,
    `questionType` ENUM('SINGLE_CHOICE', 'MULTI_CHOICE', 'INPUT_TEXT', 'RATING_SCALE', 'PICTURE_SELECTION') NOT NULL,
    `formId` INTEGER NOT NULL,
    `index` INTEGER NOT NULL,

    INDEX `Question_formId_fkey`(`formId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionConfiguration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `settings` JSON NOT NULL,

    UNIQUE INDEX `QuestionConfiguration_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessQuestionConfiguration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `settings` JSON NOT NULL,

    UNIQUE INDEX `BusinessQuestionConfiguration_questionId_key`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionOnMedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mediaId` INTEGER NOT NULL,
    `questionId` INTEGER NULL,

    INDEX `QuestionOnMedia_mediaId_fkey`(`mediaId`),
    INDEX `QuestionOnMedia_questionId_fkey`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnswerOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `label` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `formResponseId` INTEGER NULL,

    INDEX `AnswerOption_questionId_fkey`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnswerOptionOnMedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mediaId` INTEGER NOT NULL,
    `answerOptionId` INTEGER NULL,
    `index` INTEGER NULL,

    INDEX `AnswerOptionOnMedia_answerOptionId_fkey`(`answerOptionId`),
    INDEX `AnswerOptionOnMedia_mediaId_fkey`(`mediaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Business` ADD CONSTRAINT `Business_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SurveyFeedback` ADD CONSTRAINT `SurveyFeedback_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFormResponse` ADD CONSTRAINT `UserFormResponse_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `SurveyFeedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserFormResponse` ADD CONSTRAINT `UserFormResponse_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponseQuestion` ADD CONSTRAINT `FormResponseQuestion_answerOptionId_fkey` FOREIGN KEY (`answerOptionId`) REFERENCES `AnswerOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponseQuestion` ADD CONSTRAINT `FormResponseQuestion_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormResponseQuestion` ADD CONSTRAINT `FormResponseQuestion_userFormResponseId_fkey` FOREIGN KEY (`userFormResponseId`) REFERENCES `UserFormResponse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormSettings` ADD CONSTRAINT `FormSettings_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `SurveyFeedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FormSettings` ADD CONSTRAINT `FormSettings_formSettingTypesId_fkey` FOREIGN KEY (`formSettingTypesId`) REFERENCES `SettingTypes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessSurveyFeedbackSettings` ADD CONSTRAINT `BusinessSurveyFeedbackSettings_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessSurveyFeedbackSettings` ADD CONSTRAINT `BusinessSurveyFeedbackSettings_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `SurveyFeedback`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `SurveyFeedback`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessQuestionConfiguration` ADD CONSTRAINT `BusinessQuestionConfiguration_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOnMedia` ADD CONSTRAINT `QuestionOnMedia_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionOnMedia` ADD CONSTRAINT `QuestionOnMedia_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerOption` ADD CONSTRAINT `AnswerOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerOptionOnMedia` ADD CONSTRAINT `AnswerOptionOnMedia_answerOptionId_fkey` FOREIGN KEY (`answerOptionId`) REFERENCES `AnswerOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnswerOptionOnMedia` ADD CONSTRAINT `AnswerOptionOnMedia_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
