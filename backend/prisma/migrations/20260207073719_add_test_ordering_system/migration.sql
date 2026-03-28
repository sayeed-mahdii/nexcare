-- CreateTable
CREATE TABLE `DiagnosticTest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestBooking` (
    `id` VARCHAR(191) NOT NULL,
    `guestEmail` VARCHAR(191) NOT NULL,
    `guestName` VARCHAR(191) NULL,
    `guestPhone` VARCHAR(191) NULL,
    `accessCode` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NULL,
    `otpExpiresAt` DATETIME(3) NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `reportPath` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuestBooking_accessCode_key`(`accessCode`),
    INDEX `GuestBooking_guestEmail_idx`(`guestEmail`),
    INDEX `GuestBooking_accessCode_idx`(`accessCode`),
    INDEX `GuestBooking_branchId_idx`(`branchId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuestBookingItem` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NOT NULL,

    INDEX `GuestBookingItem_bookingId_idx`(`bookingId`),
    INDEX `GuestBookingItem_testId_idx`(`testId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Test` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('LAB', 'IMAGING', 'PROCEDURE') NOT NULL DEFAULT 'LAB',
    `isGeneral` BOOLEAN NOT NULL DEFAULT false,
    `isMandatory` BOOLEAN NOT NULL DEFAULT false,
    `departmentId` VARCHAR(191) NULL,
    `inputType` ENUM('NUMERIC', 'TEXT', 'FILE') NOT NULL DEFAULT 'NUMERIC',
    `unit` VARCHAR(191) NULL,
    `referenceRange` VARCHAR(191) NULL,
    `price` DOUBLE NOT NULL DEFAULT 0,
    `requiresPathologist` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Test_departmentId_idx`(`departmentId`),
    INDEX `Test_category_idx`(`category`),
    INDEX `Test_isGeneral_idx`(`isGeneral`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestOrder` (
    `id` VARCHAR(191) NOT NULL,
    `appointmentId` VARCHAR(191) NOT NULL,
    `testId` VARCHAR(191) NOT NULL,
    `status` ENUM('ORDERED', 'IN_PROGRESS', 'PATHOLOGIST_VERIFIED', 'DOCTOR_VERIFIED', 'DELIVERED') NOT NULL DEFAULT 'ORDERED',
    `clinicalNote` TEXT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'Normal',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TestOrder_appointmentId_idx`(`appointmentId`),
    INDEX `TestOrder_testId_idx`(`testId`),
    INDEX `TestOrder_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TestResult` (
    `id` VARCHAR(191) NOT NULL,
    `testOrderId` VARCHAR(191) NOT NULL,
    `resultData` JSON NOT NULL,
    `impression` TEXT NULL,
    `verifiedById` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TestResult_testOrderId_key`(`testOrderId`),
    INDEX `TestResult_verifiedById_idx`(`verifiedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `GuestBooking` ADD CONSTRAINT `GuestBooking_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestBookingItem` ADD CONSTRAINT `GuestBookingItem_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `GuestBooking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuestBookingItem` ADD CONSTRAINT `GuestBookingItem_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `DiagnosticTest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestOrder` ADD CONSTRAINT `TestOrder_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestOrder` ADD CONSTRAINT `TestOrder_testId_fkey` FOREIGN KEY (`testId`) REFERENCES `Test`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResult` ADD CONSTRAINT `TestResult_testOrderId_fkey` FOREIGN KEY (`testOrderId`) REFERENCES `TestOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestResult` ADD CONSTRAINT `TestResult_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `Pathologist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
