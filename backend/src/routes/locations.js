const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);

// Admin only routes
router.use(auth);
router.post('/', roleCheck('Administrator'), locationController.createLocation);
router.put('/:id', roleCheck('Administrator'), locationController.updateLocation);
router.delete('/:id', roleCheck('Administrator'), locationController.deleteLocation);

module.exports = router;
