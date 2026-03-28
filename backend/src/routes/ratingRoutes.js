const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
    submitRating,
    getDoctorRatings,
    getMyRatings,
    getMyDoctorRatings,
} = require('../controllers/ratingController');

// Patient routes - auth middleware must come before roleCheck
router.post('/', auth, roleCheck('Patient'), submitRating);
router.get('/my', auth, roleCheck('Patient'), getMyRatings);

// Doctor route - get their own ratings
router.get('/my-doctor-ratings', auth, roleCheck('Doctor'), getMyDoctorRatings);

// Public route - get doctor's ratings
router.get('/doctor/:doctorId', getDoctorRatings);

module.exports = router;
