// Script to approve all pending doctors
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveAllDoctors() {
    try {
        // Find all unapproved doctors
        const pendingDoctors = await prisma.doctor.findMany({
            where: { isApproved: false },
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true }
                }
            }
        });

        console.log(`Found ${pendingDoctors.length} pending doctors:`);
        pendingDoctors.forEach(doc => {
            console.log(`  - ${doc.user.firstName} ${doc.user.lastName} (${doc.user.email})`);
        });

        if (pendingDoctors.length === 0) {
            console.log('No pending doctors to approve.');
            return;
        }

        // Approve all doctors
        const result = await prisma.doctor.updateMany({
            where: { isApproved: false },
            data: {
                isApproved: true,
                approvedAt: new Date()
            }
        });

        console.log(`\n✅ Successfully approved ${result.count} doctor(s)!`);
        console.log('Doctors should now appear on the public doctors page.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

approveAllDoctors();
