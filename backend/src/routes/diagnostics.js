const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const diagnosticController = require('../controllers/diagnosticController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Configure multer for report uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/reports');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed.'));
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// ============ PUBLIC ROUTES ============

// Get all available diagnostic tests
router.get('/tests', diagnosticController.getAllTests);

// Get test categories
router.get('/tests/categories', diagnosticController.getTestCategories);

// Create a guest booking (Init + Send OTP)
router.post('/guest-booking', diagnosticController.createGuestBooking);

// Resend OTP
router.post('/guest-booking/resend-otp', diagnosticController.resendOTP);

// Verify Guest Booking OTP (Checkout)
router.post('/guest-booking/verify', diagnosticController.verifyGuestBookingOTP);

// Guest Login (Request OTP)
router.post('/guest/login', diagnosticController.requestGuestLogin);

// Guest Login Verify
router.post('/guest/login/verify', diagnosticController.verifyGuestLogin);

// Get guest booking by access code (Now protected or public? Public for now but could be protected by ensuring session)
router.get('/guest-booking/:accessCode', diagnosticController.getGuestBooking);

// Get Booking Receipt
router.get('/guest-booking/:accessCode/receipt', diagnosticController.getBookingReceipt);

// ============ ADMIN ROUTES ============

// All routes below require authentication and admin role
router.use(auth);
router.use(roleCheck('Administrator'));

// Get all guest bookings
router.get('/guest-bookings', diagnosticController.getAllGuestBookings);

// Get pending bookings count
router.get('/guest-bookings/pending-count', diagnosticController.getPendingBookingsCount);

// Approve a guest booking
router.put('/guest-booking/:id/approve', diagnosticController.approveGuestBooking);

// Complete a guest booking with report upload
router.put('/guest-booking/:id/complete', upload.single('report'), diagnosticController.completeGuestBooking);

// Cancel a guest booking
router.put('/guest-booking/:id/cancel', diagnosticController.cancelGuestBooking);

// CRUD for diagnostic tests
router.post('/tests', diagnosticController.createTest);
router.put('/tests/:id', diagnosticController.updateTest);
router.delete('/tests/:id', diagnosticController.deleteTest);

module.exports = router;
