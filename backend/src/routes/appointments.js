const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public route for available slots
router.get('/slots', appointmentController.getAvailableSlots);

// All other routes require authentication
router.use(auth);

// Get all appointments (Admin and Doctor)
router.get('/', roleCheck('Administrator', 'Doctor'), appointmentController.getAllAppointments);

// Create appointment (Patient)
router.post('/', roleCheck('Patient'), appointmentController.createAppointment);

// Get single appointment
router.get('/:id', appointmentController.getAppointmentById);

// Update appointment (Doctor and Admin)
router.put('/:id', roleCheck('Administrator', 'Doctor'), appointmentController.updateAppointment);

// Cancel appointment (Patient, Doctor, Admin)
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;
