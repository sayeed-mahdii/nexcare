const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Patient dashboard and self-service
router.get('/my/dashboard', roleCheck('Patient'), patientController.getPatientDashboard);
router.get('/my/appointments', roleCheck('Patient'), patientController.getPatientAppointments);
router.get('/my/lab-reports', roleCheck('Patient'), patientController.getPatientLabReports);

// Admin and Doctor access
router.get('/', roleCheck('Administrator', 'Doctor'), patientController.getAllPatients);
router.get('/:id', roleCheck('Administrator', 'Doctor'), patientController.getPatientById);
router.put('/:id', roleCheck('Administrator', 'Doctor'), patientController.updatePatient);

module.exports = router;
