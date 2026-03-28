const express = require('express');
const router = express.Router();
const testOrderController = require('../controllers/testOrderController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Doctor routes
router.post('/', roleCheck('Doctor'), testOrderController.createTestOrder);
router.post('/bulk', roleCheck('Doctor'), testOrderController.createBulkTestOrders);
router.get('/appointment/:appointmentId', roleCheck('Doctor', 'Pathologist'), testOrderController.getAppointmentTestOrders);
router.get('/pending-verification', roleCheck('Doctor'), testOrderController.getPendingDoctorVerification);
router.put('/:id/doctor-verify', roleCheck('Doctor'), testOrderController.doctorVerifyResult);

// Pathologist routes
router.get('/pending', roleCheck('Pathologist'), testOrderController.getPendingTestOrders);
router.post('/:id/result', roleCheck('Pathologist'), testOrderController.submitTestResult);

// Patient routes
router.get('/my-results', roleCheck('Patient'), testOrderController.getPatientTestResults);

// Status update (Doctor or Pathologist)
router.put('/:id/status', roleCheck('Doctor', 'Pathologist'), testOrderController.updateTestOrderStatus);

module.exports = router;
