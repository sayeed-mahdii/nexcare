const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Check ---');
    console.log('DB URL:', process.env.DATABASE_URL);

    const guestBookingCount = await prisma.guestBooking.count();
    const labReportCount = await prisma.labReport.count();
    const pendingBookingCount = await prisma.guestBooking.count({ where: { status: 'Pending' } });

    const counts = {
        totalGuestBookings: guestBookingCount,
        pendingGuestBookings: pendingBookingCount,
        totalLabReports: labReportCount
    };
    console.log('JSON_OUTPUT_START');
    console.log(JSON.stringify(counts));
    console.log('JSON_OUTPUT_END');

    // List IDs to confirm
    const bookings = await prisma.guestBooking.findMany({
        select: { id: true, status: true, guestEmail: true },
        take: 5
    });
    console.log('\nSample Bookings:', bookings);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
