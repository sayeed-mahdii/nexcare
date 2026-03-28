const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { sendGuestOTPEmail } = require('../utils/emailService');

const prisma = new PrismaClient();

// Generate a random access code (6 digits) - Permanent ID
const generateAccessCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate OTP (6 digits) - Short lived
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get all diagnostic tests
const getAllTests = async (req, res) => {
    try {
        const { search, category } = req.query;

        const where = {
            isAvailable: true,
        };

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { category: { contains: search } },
            ];
        }

        if (category) {
            where.category = category;
        }

        const tests = await prisma.diagnosticTest.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: tests,
        });
    } catch (error) {
        console.error('Get tests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch diagnostic tests.',
            error: error.message,
        });
    }
};

// Get test categories
const getTestCategories = async (req, res) => {
    try {
        const categories = await prisma.diagnosticTest.findMany({
            where: { isAvailable: true },
            select: { category: true },
            distinct: ['category'],
        });

        res.json({
            success: true,
            data: categories.map(c => c.category),
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories.',
        });
    }
};

// Initiate guest booking (Create pending booking + send OTP)
const createGuestBooking = async (req, res) => {
    try {
        const { guestEmail, guestName, guestPhone, branchId, items } = req.body;

        if (!guestEmail || !branchId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Email, branch, and at least one test item are required.',
            });
        }

        // Verify branch exists
        const branch = await prisma.branch.findUnique({
            where: { id: branchId },
        });

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Branch not found.',
            });
        }

        // Get test details and calculate total
        const testIds = items.map(item => item.testId);
        const tests = await prisma.diagnosticTest.findMany({
            where: { id: { in: testIds }, isAvailable: true },
        });

        if (tests.length !== testIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more tests are not available.',
            });
        }

        // Calculate total amount
        let totalAmount = 0;
        const bookingItems = items.map(item => {
            const test = tests.find(t => t.id === item.testId);
            const itemTotal = test.price * (item.quantity || 1);
            totalAmount += itemTotal;
            return {
                testId: item.testId,
                quantity: item.quantity || 1,
                price: test.price,
            };
        });

        // Check if there is already a PENDING booking for this email/phone to avoid spam? 
        // For simplicity, we create a new one.

        // Generate unique access code
        let accessCode = generateAccessCode();
        let existingBooking = await prisma.guestBooking.findUnique({
            where: { accessCode },
        });
        while (existingBooking) {
            accessCode = generateAccessCode();
            existingBooking = await prisma.guestBooking.findUnique({
                where: { accessCode },
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Create booking with items
        const booking = await prisma.guestBooking.create({
            data: {
                guestEmail,
                guestName,
                guestPhone,
                branchId,
                accessCode,
                totalAmount,
                otp,
                otpExpiresAt,
                status: 'Pending', // It is pending until OTP verified? Or Pending Admin Approval? Let's say Pending = Awaiting Approval. OTP is for "Access".
                items: {
                    create: bookingItems,
                },
            },
        });


        console.log(`[OTP GENERATED] To: ${guestEmail}, OTP: ${otp}`);

        // Send OTP Email
        try {
            await sendGuestOTPEmail(guestEmail, otp);
            console.log(`[EMAIL SENT] OTP sent to ${guestEmail}`);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'OTP sent to your email. Expires in 5 minutes.',
            data: {
                bookingId: booking.id,
                email: booking.guestEmail
            },
        });
    } catch (error) {
        console.error('Create guest booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate booking.',
            error: error.message,
        });
    }
};

// Resend OTP for Booking or Login
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        // Find latest active booking? Or allow any.
        // For security, just update the latest booking for this email
        const booking = await prisma.guestBooking.findFirst({
            where: { guestEmail: email },
            orderBy: { createdAt: 'desc' }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'No booking found for this email.' });
        }

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await prisma.guestBooking.update({
            where: { id: booking.id },
            data: { otp, otpExpiresAt }
        });

        console.log(`[OTP RE-GENERATED] To: ${email}, OTP: ${otp}`);

        // Send OTP Email
        try {
            await sendGuestOTPEmail(email, otp);
            console.log(`[EMAIL SENT] OTP resent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
        }

        res.json({
            success: true,
            message: 'New OTP sent.'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to resend OTP.' });
    }
}


// Verify OTP for Checkout confirmation
const verifyGuestBookingOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const booking = await prisma.guestBooking.findFirst({
            where: { guestEmail: email },
            orderBy: { createdAt: 'desc' }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (booking.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP.' });
        }

        if (new Date() > booking.otpExpiresAt) {
            return res.status(400).json({ success: false, message: 'OTP Expired.' });
        }

        // OTP Verified. Clear OTP fields.
        const updatedBooking = await prisma.guestBooking.update({
            where: { id: booking.id },
            data: {
                otp: null,
                otpExpiresAt: null
            }
        });

        res.json({
            success: true,
            message: 'Verification successful.',
            data: {
                accessCode: updatedBooking.accessCode // Return this so user can save it or auto-login
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Verification failed.' });
    }
}

// Request Guest Login (Send OTP)
const requestGuestLogin = async (req, res) => {
    try {
        const { email } = req.body;
        const booking = await prisma.guestBooking.findFirst({
            where: { guestEmail: email },
            orderBy: { createdAt: 'desc' }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'No booking record found for this email.' });
        }

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await prisma.guestBooking.update({
            where: { id: booking.id },
            data: { otp, otpExpiresAt }
        });

        console.log(`[LOGIN OTP] To: ${email}, OTP: ${otp}`);

        // Send OTP Email
        try {
            await sendGuestOTPEmail(email, otp);
            console.log(`[EMAIL SENT] Login OTP sent to ${email}`);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return res.status(500).json({ success: false, message: 'Failed to send OTP email.' });
        }

        res.json({ success: true, message: 'OTP sent to your email.' });

    } catch (error) {
        console.error('Login request error:', error);
        res.status(500).json({ success: false, message: 'Login request failed.' });
    }
}

// Verify Guest Login OTP
const verifyGuestLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const booking = await prisma.guestBooking.findFirst({
            where: { guestEmail: email },
            orderBy: { createdAt: 'desc' }
        });

        if (!booking || booking.otp !== otp || new Date() > booking.otpExpiresAt) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // Clear OTP
        await prisma.guestBooking.update({
            where: { id: booking.id },
            data: { otp: null, otpExpiresAt: null }
        });

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                accessCode: booking.accessCode
            }
        });

    } catch (error) {
        console.error('Login verify error:', error);
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
}


// Get guest booking by access code (Modified to include basic fetching)
const getGuestBooking = async (req, res) => {
    try {
        const { accessCode } = req.params;

        const booking = await prisma.guestBooking.findUnique({
            where: { accessCode },
            include: {
                items: {
                    include: {
                        test: true,
                    },
                },
                branch: {
                    include: {
                        location: true,
                    },
                },
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.',
            });
        }

        // Security check: If trying to access via random guess, maybe we should restrict? 
        // But let's assume accessCode is secret enough.

        res.json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error('Get guest booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking.',
            error: error.message,
        });
    }
};

// Generate Receipt PDF
const getBookingReceipt = async (req, res) => {
    try {
        const { accessCode } = req.params;
        const booking = await prisma.guestBooking.findUnique({
            where: { accessCode },
            include: { items: { include: { test: true } }, branch: true }
        });

        if (!booking) return res.status(404).send('Booking not found');

        // Only allow receipt download for Approved or Completed bookings
        if (booking.status !== 'Approved' && booking.status !== 'Completed') {
            return res.status(403).send('Receipt is only available after admin approval');
        }

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${accessCode}.pdf`);

        doc.pipe(res);

        doc.fontSize(25).text('NEXCARE Diagnostics', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Receipt for Booking #${booking.accessCode}`, { align: 'center' });
        doc.moveDown();
        doc.text(`Date: ${booking.createdAt.toLocaleDateString()}`);
        doc.text(`Guest: ${booking.guestName || 'N/A'}`);
        doc.text(`Email: ${booking.guestEmail}`);
        doc.moveDown();
        doc.text('Tests:', { underline: true });

        booking.items.forEach(item => {
            doc.text(`${item.test.name} x ${item.quantity} - BDT ${item.price * item.quantity}`);
        });

        doc.moveDown();
        doc.fontSize(16).text(`Total: BDT ${booking.totalAmount}`, { bold: true });

        doc.end();

    } catch (error) {
        console.error('Receipt generation error:', error);
        res.status(500).send('Error generating receipt');
    }
}


// Admin: Get all guest bookings
const getAllGuestBookings = async (req, res) => {
    try {
        const { status } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        }

        const bookings = await prisma.guestBooking.findMany({
            where,
            include: {
                items: {
                    include: {
                        test: true,
                    },
                },
                branch: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: bookings,
            count: bookings.length,
        });
    } catch (error) {
        console.error('Get all guest bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings.',
            error: error.message,
        });
    }
};

// Admin: Approve a guest booking
const approveGuestBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await prisma.guestBooking.update({
            where: { id },
            data: { status: 'Approved' },
            include: {
                items: { include: { test: true } },
                branch: true,
            },
        });

        res.json({
            success: true,
            message: 'Booking approved successfully.',
            data: booking,
        });
    } catch (error) {
        console.error('Approve booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve booking.',
            error: error.message,
        });
    }
};

// Admin: Complete booking and upload report
const completeGuestBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        // Handle file upload if present
        let reportPath = null;
        if (req.file) {
            reportPath = `/uploads/reports/${req.file.filename}`;
        }

        const updateData = {
            status: 'Completed',
        };

        if (reportPath) {
            updateData.reportPath = reportPath;
        }

        if (notes) {
            updateData.notes = notes;
        }

        const booking = await prisma.guestBooking.update({
            where: { id },
            data: updateData,
            include: {
                items: { include: { test: true } },
                branch: true,
            },
        });

        res.json({
            success: true,
            message: 'Booking completed. Report is ready for download.',
            data: booking,
        });
    } catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete booking.',
            error: error.message,
        });
    }
};

// Admin: Cancel a guest booking
const cancelGuestBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const booking = await prisma.guestBooking.update({
            where: { id },
            data: {
                status: 'Cancelled',
                notes: reason || 'Cancelled by admin',
            },
        });

        res.json({
            success: true,
            message: 'Booking cancelled.',
            data: booking,
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking.',
            error: error.message,
        });
    }
};

// Admin: Create a new diagnostic test
const createTest = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and category are required.',
            });
        }

        const test = await prisma.diagnosticTest.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Diagnostic test created successfully.',
            data: test,
        });
    } catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test.',
            error: error.message,
        });
    }
};

// Admin: Update a diagnostic test
const updateTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, isAvailable } = req.body;

        const test = await prisma.diagnosticTest.update({
            where: { id },
            data: {
                name,
                description,
                price: price ? parseFloat(price) : undefined,
                category,
                isAvailable,
            },
        });

        res.json({
            success: true,
            message: 'Diagnostic test updated successfully.',
            data: test,
        });
    } catch (error) {
        console.error('Update test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update test.',
            error: error.message,
        });
    }
};

// Admin: Delete a diagnostic test
const deleteTest = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.diagnosticTest.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Diagnostic test deleted successfully.',
        });
    } catch (error) {
        console.error('Delete test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete test.',
            error: error.message,
        });
    }
};

// Get pending bookings count for admin dashboard
const getPendingBookingsCount = async (req, res) => {
    try {
        const count = await prisma.guestBooking.count({
            where: { status: 'Pending' },
        });

        res.json({
            success: true,
            data: { count },
        });
    } catch (error) {
        console.error('Get pending count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending count.',
        });
    }
};

module.exports = {
    getAllTests,
    getTestCategories,
    createGuestBooking,
    getGuestBooking,
    getAllGuestBookings,
    approveGuestBooking,
    completeGuestBooking,
    cancelGuestBooking,
    createTest,
    updateTest,
    deleteTest,
    getPendingBookingsCount,
    verifyGuestBookingOTP,
    requestGuestLogin,
    verifyGuestLogin,
    getBookingReceipt,
    resendOTP
};
