const express = require('express');
const router = express.Router();
const {
    loginAdmin
} = require('../controllers/authController')

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

router.post('/login', loginLimiter, loginAdmin);

module.exports = router;