const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, logoutUser } = require('../controller/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.get('/users', protect, getUsers);

module.exports = router;
