/*
  Warnings:

  - A unique constraint covering the columns `[mediaId]` on the table `AnswerOptionOnMedia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[answerOptionId]` on the table `AnswerOptionOnMedia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `AnswerOptionOnMedia_mediaId_key` ON `AnswerOptionOnMedia`(`mediaId`);

-- CreateIndex
CREATE UNIQUE INDEX `AnswerOptionOnMedia_answerOptionId_key` ON `AnswerOptionOnMedia`(`answerOptionId`);
