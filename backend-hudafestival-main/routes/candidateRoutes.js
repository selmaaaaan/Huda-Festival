const express = require('express');
const router = express.Router();
const {
    createCandidate,
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    addMinusPoints,
    searchCandidates,
    getCandidateResults,
} = require('../controllers/candidateController');

const upload = require('../config/cloudinary');
const { protect, authorize, optionalProtect, scopeToOwnTeam } = require('../middlewares/authMiddleware');

router.route('/')
    .get(optionalProtect, scopeToOwnTeam, getAllCandidates)
    .post(protect, authorize('admin'), upload.single('image'), createCandidate);

router.route('/search').get(searchCandidates);

router.route('/:id')
    .get(getCandidateById)
    .put(protect, authorize('admin'), upload.single('image'), updateCandidate)
    .delete(protect, authorize('admin'), deleteCandidate);

router.route('/:id/minus-points').post(protect, addMinusPoints);

router.route('/:id/results').get(getCandidateResults);

module.exports = router;

