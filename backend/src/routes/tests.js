const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all tests (any authenticated user)
router.get('/', testController.getAllTests);

// Get tests for doctor ordering (by department)
router.get('/ordering/:departmentId', roleCheck('Doctor'), testController.getTestsForOrdering);

// Get single test
router.get('/:id', testController.getTestById);

// Admin-only routes
router.post('/', roleCheck('Administrator'), testController.createTest);
router.put('/:id', roleCheck('Administrator'), testController.updateTest);
router.delete('/:id', roleCheck('Administrator'), testController.deleteTest);

module.exports = router;
