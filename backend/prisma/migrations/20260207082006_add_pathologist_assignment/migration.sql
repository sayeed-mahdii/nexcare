-- AlterTable
ALTER TABLE `testorder` ADD COLUMN `assignedPathologistId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `testresult` ADD COLUMN `reportFile` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `TestOrder_assignedPathologistId_idx` ON `TestOrder`(`assignedPathologistId`);

-- AddForeignKey
ALTER TABLE `TestOrder` ADD CONSTRAINT `TestOrder_assignedPathologistId_fkey` FOREIGN KEY (`assignedPathologistId`) REFERENCES `Pathologist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
