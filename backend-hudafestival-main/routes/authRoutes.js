const express = require('express');
const router = express.Router();
const {
    loginAdmin,
    registerAdmin,
    teamLeaderLogin,
    createTeamLeader,
    getAllTeamLeaders,
    updateTeamLeader,
    deleteTeamLeader
} = require('../controllers/authController')

const { protect, authorize } = require('../middlewares/authMiddleware');

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

router.post('/login', loginLimiter, loginAdmin);
router.post('/team-leader/login', loginLimiter, teamLeaderLogin);
router.post('/signup', registerAdmin);
router.post('/create-team-leader', protect, authorize('admin'), createTeamLeader);
router.get('/team-leaders', protect, authorize('admin'), getAllTeamLeaders);
router.route('/team-leaders/:id')
    .patch(protect, authorize('admin'), updateTeamLeader)
    .delete(protect, authorize('admin'), deleteTeamLeader);

module.exports = router;