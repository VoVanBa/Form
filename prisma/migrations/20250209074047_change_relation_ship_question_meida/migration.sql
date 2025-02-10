/*
  Warnings:

  - A unique constraint covering the columns `[mediaId]` on the table `QuestionOnMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[questionId]` on the table `QuestionOnMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `QuestionOnMedia_mediaId_key` ON `QuestionOnMedia`(`mediaId`);

-- CreateIndex
CREATE UNIQUE INDEX `QuestionOnMedia_questionId_key` ON `QuestionOnMedia`(`questionId`);
