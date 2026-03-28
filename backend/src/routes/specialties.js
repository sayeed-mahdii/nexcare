const express = require('express');
const router = express.Router();
const specialtyController = require('../controllers/specialtyController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', specialtyController.getAllSpecialties);
router.get('/:id', specialtyController.getSpecialtyById);

// Admin only routes
router.use(auth);
router.post('/', roleCheck('Administrator'), specialtyController.createSpecialty);
router.put('/:id', roleCheck('Administrator'), specialtyController.updateSpecialty);
router.delete('/:id', roleCheck('Administrator'), specialtyController.deleteSpecialty);

module.exports = router;
