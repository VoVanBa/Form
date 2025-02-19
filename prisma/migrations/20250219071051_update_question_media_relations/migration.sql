/*
  Warnings:

  - A unique constraint covering the columns `[questionId]` on the table `QuestionOnMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `QuestionOnMedia_questionId_key` ON `QuestionOnMedia`(`questionId`);
