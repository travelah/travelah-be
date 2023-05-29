/*
  Warnings:

  - You are about to drop the column `topicId` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `commentCount` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `likeCount` on the `post` table. All the data in the column will be lost.
  - You are about to drop the `topic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `groupChatId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_topicId_fkey`;

-- AlterTable
ALTER TABLE `chat` DROP COLUMN `topicId`,
    ADD COLUMN `groupChatId` INTEGER NOT NULL,
    MODIFY `question` TEXT NOT NULL,
    MODIFY `response` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `comment` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `post` DROP COLUMN `commentCount`,
    DROP COLUMN `likeCount`,
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `fullName` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `topic`;

-- CreateTable
CREATE TABLE `GroupChat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GroupChat_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_groupChatId_fkey` FOREIGN KEY (`groupChatId`) REFERENCES `GroupChat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
