/*
  Warnings:

  - You are about to drop the `testresult` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `testresult` DROP FOREIGN KEY `TestResult_testOrderId_fkey`;

-- DropForeignKey
ALTER TABLE `testresult` DROP FOREIGN KEY `TestResult_verifiedById_fkey`;

-- DropTable
DROP TABLE `testresult`;

-- CreateTable
CREATE TABLE `TestResult` (
    `id` VARCHAR(191) NOT NULL,
    `testOrderId` VARCHAR(191) NOT NULL,
    `resultData` JSON NOT NULL,
    `impression` TEXT NULL,
    `reportFile` VARCHAR(191) NULL,
    `verifiedById` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TestResult_testOrderId_key`(`testOrderId`),
    INDEX `TestResult_verifiedById_idx`(`verifiedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DoctorRating` (
    `id` VARCHAR(191) NOT NULL,
    `doctorId` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `feedback` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DoctorRating_appointmentId_key`(`appointmentId`),
    INDEX `DoctorRating_doctorId_idx`(`doctorId`),
    INDEX `DoctorRating_patientId_idx`(`patientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TestResult` ADD CONSTRAINT `TestResult_testOrderId_fkey` FOREIGN KEY (`testOrderId`) REFERENCES `TestOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResult` ADD CONSTRAINT `TestResult_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `Pathologist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorRating` ADD CONSTRAINT `DoctorRating_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `Doctor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorRating` ADD CONSTRAINT `DoctorRating_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `Patient`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DoctorRating` ADD CONSTRAINT `DoctorRating_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
