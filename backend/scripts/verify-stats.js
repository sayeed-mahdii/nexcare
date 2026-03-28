const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyStats() {
    try {
        console.log('--- Verifying Database Stats ---');

        // Count by User Role
        const userCounts = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true
            }
        });
        console.log('User Counts by Role:', userCounts);

        // Count specific tables
        const doctors = await prisma.doctor.count();
        const patients = await prisma.patient.count();
        const pathologists = await prisma.pathologist.count();

        console.log('Table Counts:');
        console.log('Doctors:', doctors);
        console.log('Patients:', patients);
        console.log('Pathologists:', pathologists);

        // Check for specific role casing
        console.log('--- Checking first 5 users ---');
        const users = await prisma.user.findMany({
            take: 5,
            select: { id: true, firstName: true, role: true }
        });
        console.log(users);

    } catch (error) {
        console.error('Error verifying stats:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyStats();
