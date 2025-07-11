const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const { registerUser, getProfile, updateProfile } = require('../controllers/userController');
const { postBloodRequest, getBloodRequest, respondToBloodRequest, completeDonation } = require('../controllers/requestController');

router.post('/register', registerUser);
router.get('/profile', checkAuth, getProfile);
router.put('/profile', checkAuth, updateProfile);
router.post('/requests', checkAuth, postBloodRequest);
router.get('/requests', checkAuth, getBloodRequest);
router.post('/requests/:id/respond', checkAuth, respondToBloodRequest);
router.post('/requests/:id/complete', checkAuth, completeDonation );

module.exports = router;
