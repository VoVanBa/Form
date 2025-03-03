/*
  Warnings:

  - You are about to drop the `QuestionCondition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionLogic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `QuestionCondition` DROP FOREIGN KEY `QuestionCondition_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `QuestionCondition` DROP FOREIGN KEY `QuestionCondition_questionLogicId_fkey`;

-- DropTable
DROP TABLE `QuestionCondition`;

-- DropTable
DROP TABLE `QuestionLogic`;
