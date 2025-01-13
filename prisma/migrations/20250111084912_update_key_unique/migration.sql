/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `FormSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `FormSettings_key_key` ON `FormSettings`(`key`);
