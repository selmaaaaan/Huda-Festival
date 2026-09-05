const express = require('express');
const router = express.Router();
const {getLeaderboards} = require('../controllers/leaderboardController');


 router.route('/')
    .get(getLeaderboards)

module.exports = router;