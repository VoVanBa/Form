-- CreateTable
CREATE TABLE `QuestionCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `targetQuestionId` INTEGER NOT NULL,
    `sourceQuestionId` INTEGER NOT NULL,
    `conditionType` ENUM('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'BETWEEN') NOT NULL,
    `conditionValue` JSON NOT NULL,
    `logicalOperator` ENUM('AND', 'OR') NOT NULL DEFAULT 'AND',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `QuestionCondition` ADD CONSTRAINT `QuestionCondition_targetQuestionId_fkey` FOREIGN KEY (`targetQuestionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionCondition` ADD CONSTRAINT `QuestionCondition_sourceQuestionId_fkey` FOREIGN KEY (`sourceQuestionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
