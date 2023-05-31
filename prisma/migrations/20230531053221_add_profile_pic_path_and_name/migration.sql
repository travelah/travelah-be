/*
  Warnings:

  - Added the required column `profilePicName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profilePicPath` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `profilePicName` VARCHAR(191) NOT NULL,
    ADD COLUMN `profilePicPath` VARCHAR(191) NOT NULL;
