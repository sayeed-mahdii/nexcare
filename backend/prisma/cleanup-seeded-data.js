// Script to delete seeded doctors and patients (keeps admin, pathologist, locations, branches, departments)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️ Deleting seeded doctors and patients...\n');

    // First, delete related records that have foreign keys

    // Delete test results first
    const testResultsDeleted = await prisma.testResult.deleteMany({});
    console.log(`   Deleted ${testResultsDeleted.count} test results`);

    // Delete test orders
    const testOrdersDeleted = await prisma.testOrder.deleteMany({});
    console.log(`   Deleted ${testOrdersDeleted.count} test orders`);

    // Delete appointments (has doctorId and patientId foreign keys)
    const appointmentsDeleted = await prisma.appointment.deleteMany({});
    console.log(`   Deleted ${appointmentsDeleted.count} appointments`);

    // Delete lab reports (has patientId and doctorId foreign keys)
    const labReportsDeleted = await prisma.labReport.deleteMany({});
    console.log(`   Deleted ${labReportsDeleted.count} lab reports`);

    // Delete doctor specialties
    const doctorSpecialtiesDeleted = await prisma.doctorSpecialty.deleteMany({});
    console.log(`   Deleted ${doctorSpecialtiesDeleted.count} doctor specialties`);

    // Now delete doctors and patients
    const doctorsDeleted = await prisma.doctor.deleteMany({});
    console.log(`   Deleted ${doctorsDeleted.count} doctor records`);

    const patientsDeleted = await prisma.patient.deleteMany({});
    console.log(`   Deleted ${patientsDeleted.count} patient records`);

    // Delete users with role 'Doctor' or 'Patient' (keeps Admin and Pathologist)
    const usersDeleted = await prisma.user.deleteMany({
        where: {
            role: {
                in: ['Doctor', 'Patient']
            }
        }
    });
    console.log(`   Deleted ${usersDeleted.count} user accounts (Doctor/Patient only)`);

    console.log('\n✅ Cleanup complete!');
    console.log('\n📝 What remains:');
    console.log('   - Admin accounts');
    console.log('   - Pathologist account');
    console.log('   - Locations, Branches, Departments');
    console.log('   - Diagnostic Tests');
    console.log('   - Lab infrastructure');
    console.log('\n👉 You can now register your doctor "Sayeed Mahdi" and patients fresh!');
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
