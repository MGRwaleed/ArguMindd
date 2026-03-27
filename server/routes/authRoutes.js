const express = require('express');
const { signup, login, updateName, changePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public
router.post('/signup', signup);
router.post('/login', login);

// Protected
router.put('/update-name', protect, updateName);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;