-- AlterTable
ALTER TABLE `ResponseOnQuestion` ADD COLUMN `otherAnswer` TEXT NULL;

-- RenameIndex
ALTER TABLE `Question` RENAME INDEX `Question_formId_fkey` TO `Question_formId_idx`;

-- RenameIndex
ALTER TABLE `ResponseOnQuestion` RENAME INDEX `ResponseOnQuestion_useronResponseId_fkey` TO `ResponseOnQuestion_useronResponseId_idx`;

-- RenameIndex
ALTER TABLE `UserOnResponse` RENAME INDEX `UserOnResponse_formId_fkey` TO `UserOnResponse_formId_idx`;

-- RenameIndex
ALTER TABLE `UserOnResponse` RENAME INDEX `UserOnResponse_userId_fkey` TO `UserOnResponse_userId_idx`;
