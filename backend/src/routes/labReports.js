const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Pathologist dashboard
router.get('/my/dashboard', roleCheck('Pathologist'), labReportController.getPathologistDashboard);

// Get all lab reports (Admin, Doctor, Pathologist)
router.get('/', roleCheck('Administrator', 'Doctor', 'Pathologist'), labReportController.getAllLabReports);

// Create lab report (Pathologist only)
router.post('/', roleCheck('Pathologist'), labReportController.createLabReport);

// Get single report
router.get('/:id', labReportController.getLabReportById);

// Update report (Pathologist and Doctor)
router.put('/:id', roleCheck('Pathologist', 'Doctor'), labReportController.updateLabReport);

module.exports = router;
