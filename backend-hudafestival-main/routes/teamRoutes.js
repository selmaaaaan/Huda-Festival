const express = require('express');
const router = express.Router();
const {
    createTeam,
    getAllTeams,
    deleteTeamById,
    getTeamById,
    updateTeamById,

} = require('../controllers/teamController');
const {protect} = require('../middlewares/authMiddleware');

router.route('/')
    .get(getAllTeams)
    .post(protect ,createTeam);

router.route('/:id')
    .get(getTeamById)
    .put(protect, updateTeamById)
    .delete(protect ,deleteTeamById);
module.exports = router;