const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🗑️  Deleting all Lab Reports...');

        // Delete all lab reports
        const deleted = await prisma.labReport.deleteMany({});

        console.log(`✅ Deleted ${deleted.count} lab reports.`);

    } catch (error) {
        console.error('❌ Error deleting lab reports:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
