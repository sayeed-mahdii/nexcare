const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/change-password', auth, authController.changePassword);

module.exports = router;
