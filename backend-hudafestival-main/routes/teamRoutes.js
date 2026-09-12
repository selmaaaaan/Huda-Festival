const express = require('express');
const router = express.Router();
const {
    createTeam,
    getAllTeams,
    deleteTeamById,
    getTeamById,
    updateTeamById,
    getUnregisteredProgrammes,
    getRegistrationGrid
} = require('../controllers/teamController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getAllTeams)
    .post(protect, authorize('admin'), createTeam);

router.get('/:id/unregistered-programmes', protect, getUnregisteredProgrammes);
router.get('/:id/registration-grid', protect, getRegistrationGrid);

router.route('/:id')
    .get(getTeamById)
    .put(protect, authorize('admin'), updateTeamById)
    .delete(protect, authorize('admin'), deleteTeamById);

module.exports = router;