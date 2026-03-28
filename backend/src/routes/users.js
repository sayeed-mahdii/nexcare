const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Admin only routes
router.get('/', roleCheck('Administrator'), userController.getAllUsers);
router.get('/stats', roleCheck('Administrator'), userController.getDashboardStats);
router.get('/notifications', roleCheck('Administrator', 'Doctor'), userController.getNotifications);
router.post('/', roleCheck('Administrator'), userController.createUser);
router.get('/:id', roleCheck('Administrator'), userController.getUserById);
router.put('/:id', roleCheck('Administrator'), userController.updateUser);
router.delete('/:id', roleCheck('Administrator'), userController.deleteUser);

// Pathologists list (Doctor can get for dropdown)
router.get('/list/pathologists', roleCheck('Doctor', 'Administrator'), userController.getAllPathologists);

// User Profile Image Upload (Any authenticated user)
router.post('/profile-image', upload.single('image'), userController.uploadProfileImage);

// Change Password (Any authenticated user)
router.put('/change-password', userController.changePassword);

module.exports = router;

