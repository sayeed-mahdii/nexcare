const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes - get all approved doctors only
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes
router.use(auth);

// Admin only - Pending doctor approvals
router.get('/pending/list', roleCheck('Administrator'), doctorController.getPendingDoctors);
router.put('/:id/approve', roleCheck('Administrator'), doctorController.approveDoctor);
router.put('/:id/reject', roleCheck('Administrator'), doctorController.rejectDoctor);

// Doctor dashboard
router.get('/my/dashboard', roleCheck('Doctor'), doctorController.getDoctorDashboard);
router.get('/:id/appointments', doctorController.getDoctorAppointments);

// Admin only - Update doctor
router.put('/:id', roleCheck('Administrator'), doctorController.updateDoctor);

// Admin only - Delete doctor
router.delete('/:id', roleCheck('Administrator'), doctorController.deleteDoctor);

module.exports = router;

