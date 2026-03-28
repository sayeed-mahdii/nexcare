const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const departments = [
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Ophthalmology',
    'General Medicine',
    'Obstetrics & Gynecology',
    'Dermatology',
    'ENT (Ear, Nose, Throat)',
    'Oncology',
    'Nephrology',
    'Pulmonology',
    'Gastroenterology',
    'Endocrinology',
    'Psychiatry',
    'Physiotherapy & Rehabilitation'
];

async function main() {
    console.log('🔄 Syncing departments...');

    try {
        // 1. Get or Create a Branch
        let branch = await prisma.branch.findFirst();

        if (!branch) {
            console.log('⚠️ No branch found. Creating "Main Branch"...');

            // We need a location for the branch
            let location = await prisma.location.findFirst();
            if (!location) {
                console.log('⚠️ No location found. Creating "Main Location"...');
                location = await prisma.location.create({
                    data: {
                        name: "Main Location",
                        city: "Dhaka",
                        state: "Dhaka",
                        zipCode: "1000"
                    }
                });
            }

            branch = await prisma.branch.create({
                data: {
                    name: 'Main Branch',
                    locationId: location.id,
                    phone: '+880123456789',
                },
            });
            console.log(`✅ Created Main Branch (ID: ${branch.id})`);
        } else {
            console.log(`ℹ️ Using existing branch: ${branch.name}`);
        }

        // 2. Sync Departments
        let createdCount = 0;

        for (const deptName of departments) {
            const exists = await prisma.department.findFirst({
                where: {
                    name: deptName,
                    branchId: branch.id // Check within this branch
                }
            });

            if (!exists) {
                await prisma.department.create({
                    data: {
                        name: deptName,
                        branchId: branch.id
                    }
                });
                console.log(`✨ Created department: ${deptName}`);
                createdCount++;
            } else {
                // console.log(`⏩ Department already exists: ${deptName}`);
            }
        }

        console.log(`\n✅ Sync complete! Created ${createdCount} new departments.`);
        console.log(`Total departments in list: ${departments.length}`);

    } catch (error) {
        console.error('❌ Error syncing departments:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
