-- AlterTable
ALTER TABLE `post` ADD COLUMN `latitude` DECIMAL(65, 30) NULL,
    ADD COLUMN `longitude` DECIMAL(65, 30) NULL,
    MODIFY `location` VARCHAR(191) NULL;
