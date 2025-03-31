-- DropForeignKey
ALTER TABLE `ResponseOnQuestion` DROP FOREIGN KEY `ResponseOnQuestion_answerOptionId_fkey`;

-- DropIndex
DROP INDEX `ResponseOnQuestion_answerOptionId_fkey` ON `ResponseOnQuestion`;

-- CreateTable
CREATE TABLE `_AnswerOptionToResponseOnQuestion` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AnswerOptionToResponseOnQuestion_AB_unique`(`A`, `B`),
    INDEX `_AnswerOptionToResponseOnQuestion_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AnswerOptionToResponseOnQuestion` ADD CONSTRAINT `_AnswerOptionToResponseOnQuestion_A_fkey` FOREIGN KEY (`A`) REFERENCES `AnswerOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnswerOptionToResponseOnQuestion` ADD CONSTRAINT `_AnswerOptionToResponseOnQuestion_B_fkey` FOREIGN KEY (`B`) REFERENCES `ResponseOnQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
