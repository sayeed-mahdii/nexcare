const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Admin only routes
router.use(auth);
router.post('/', roleCheck('Administrator'), departmentController.createDepartment);
router.put('/:id', roleCheck('Administrator'), departmentController.updateDepartment);
router.delete('/:id', roleCheck('Administrator'), departmentController.deleteDepartment);

module.exports = router;
