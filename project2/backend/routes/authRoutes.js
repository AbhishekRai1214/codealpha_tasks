const express = require('express');
const router = express.Router();
const {registerUser, loginUser, getUsers, logoutUser} = require('../controller/authController');
const {protect} = require('../middleware/authMiddleware');
const {admin} = require('../middleware/adminMiddleware');

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/logout', protect, logoutUser);
router.get('/users',protect, admin,getUsers);

module.exports = router;