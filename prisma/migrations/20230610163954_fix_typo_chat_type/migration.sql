/*
  Warnings:

  - You are about to drop the column `typeChat` on the `chat` table. All the data in the column will be lost.
  - Added the required column `chatType` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `typeChat`,
    ADD COLUMN `chatType` INTEGER NOT NULL;
