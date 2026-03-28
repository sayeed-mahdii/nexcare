// Script to reset guest booking data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data cleanup...');

    // Delete all guest booking items first (due to foreign key)
    const deletedItems = await prisma.guestBookingItem.deleteMany({});
    console.log(`Deleted ${deletedItems.count} guest booking items`);

    // Delete all guest bookings
    const deletedBookings = await prisma.guestBooking.deleteMany({});
    console.log(`Deleted ${deletedBookings.count} guest bookings`);

    console.log('Data cleanup complete!');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
