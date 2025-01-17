/*
  Warnings:

  - You are about to drop the column `sortOrder` on the `AnswerOption` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `AnswerOption` DROP COLUMN `sortOrder`,
    ADD COLUMN `index` INTEGER NULL;
