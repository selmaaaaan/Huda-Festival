const express = require('express');
const router = express.Router();
const {
    createTeam,
    getAllTeams,
    deleteTeamById,
    getTeamById,
    updateTeamById,
} = require('../controllers/teamController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getAllTeams)
    .post(protect, authorize('admin'), createTeam);

router.route('/:id')
    .get(getTeamById)
    .put(protect, authorize('admin'), updateTeamById)
    .delete(protect, authorize('admin'), deleteTeamById);

module.exports = router;