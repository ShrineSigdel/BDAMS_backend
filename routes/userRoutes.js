const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const { registerUser, getProfile, updateProfile } = require('../controllers/userController');

router.post('/register', registerUser);
router.get('/profile', checkAuth, getProfile);
router.put('/profile', checkAuth, updateProfile);

module.exports = router;
