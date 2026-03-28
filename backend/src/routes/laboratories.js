const express = require('express');
const router = express.Router();
const laboratoryController = require('../controllers/laboratoryController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', laboratoryController.getAllLaboratories);
router.get('/:id', laboratoryController.getLaboratoryById);

// Admin only routes
router.use(auth);
router.post('/', roleCheck('Administrator'), laboratoryController.createLaboratory);
router.put('/:id', roleCheck('Administrator'), laboratoryController.updateLaboratory);
router.delete('/:id', roleCheck('Administrator'), laboratoryController.deleteLaboratory);

module.exports = router;
