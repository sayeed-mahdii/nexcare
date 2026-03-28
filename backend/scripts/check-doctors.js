const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDoctors() {
    try {
        const allDoctors = await prisma.doctor.findMany({
            include: {
                user: { select: { firstName: true, lastName: true } }
            }
        });

        console.log('Total doctors:', allDoctors.length);
        console.log('Approved:', allDoctors.filter(d => d.isApproved).length);
        console.log('Pending:', allDoctors.filter(d => !d.isApproved).length);

        allDoctors.forEach(doc => {
            console.log(`- ${doc.user.firstName} ${doc.user.lastName}: isApproved=${doc.isApproved}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkDoctors();
