-- CreateTable
CREATE TABLE `QuestionLogic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conditionType` ENUM('EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'NOT_CONTAINS', 'BETWEEN') NOT NULL,
    `conditionValue` JSON NOT NULL,
    `logicalOperator` ENUM('AND', 'OR') NOT NULL DEFAULT 'AND',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `questionLogicId` INTEGER NULL,
    `role` ENUM('SOURCE', 'TARGET') NOT NULL,

    INDEX `QuestionCondition_questionId_idx`(`questionId`),
    INDEX `QuestionCondition_questionLogicId_idx`(`questionLogicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionCondition` ADD CONSTRAINT `QuestionCondition_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionCondition` ADD CONSTRAINT `QuestionCondition_questionLogicId_fkey` FOREIGN KEY (`questionLogicId`) REFERENCES `QuestionLogic`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
