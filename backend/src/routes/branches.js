const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', branchController.getAllBranches);
router.get('/:id', branchController.getBranchById);

// Admin only routes
router.use(auth);
router.post('/', roleCheck('Administrator'), branchController.createBranch);
router.put('/:id', roleCheck('Administrator'), branchController.updateBranch);
router.delete('/:id', roleCheck('Administrator'), branchController.deleteBranch);

module.exports = router;
