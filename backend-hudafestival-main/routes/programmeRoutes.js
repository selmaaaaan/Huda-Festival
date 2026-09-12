const express = require('express');
const router = express.Router();
const {
  createProgramme, getAllProgrammes, getProgrammeById, updateProgramme, deleteProgramme,
  getProgrammeByCodeForJudging, getCandidatesForBlindJudging,
  updateTopicSettings, updateProgrammeSchedule, updateProgrammeStatus
} = require('../controllers/programmeController.js');
const { approvePendingResults } = require('../controllers/resultController.js');
const { protect, authorize } = require('../middlewares/authMiddleware.js');
const resultRouter = require('./resultRoutes.js');

// --- Main Programme Routes ---
router.get('/code/:code/judging', protect, getProgrammeByCodeForJudging);

router.route('/')
  .get(getAllProgrammes)
  .post(protect, createProgramme);

// --- Approve / Publish Routes (Admin Only) ---
const { publishBatch } = require('../controllers/resultController.js');

router.post('/publish-batch', protect, authorize('admin'), publishBatch);
router.route('/:id/approve').post(protect, authorize('admin'), approvePendingResults);

// --- Nested Result Routes ---
router.use('/:id/results', resultRouter);

const { getProgrammeRegistrations } = require('../controllers/registrationController.js');
router.get('/:id/registrations', protect, getProgrammeRegistrations);

// --- Specific Programme Routes (by ID) ---
router.route('/:id')
  .get(getProgrammeById)
  .put(protect, authorize('admin'), updateProgramme)
  .delete(protect, authorize('admin'), deleteProgramme);

router.patch('/:id/topic-settings', protect, authorize('admin'), updateTopicSettings);
router.patch('/:id/schedule',       protect, authorize('admin'), updateProgrammeSchedule);
router.patch('/:id/status',         protect, authorize('admin', 'volunteer'), updateProgrammeStatus);

// --- Code Letter Routes (admin | volunteer) ---
const { bulkAssignCodeLetters, getCodeLetters } = require('../controllers/codeLetterController.js');
router.get( '/:id/code-letters',  protect, authorize('admin', 'volunteer'), getCodeLetters);
router.post('/:id/code-letters',  protect, authorize('admin', 'volunteer'), bulkAssignCodeLetters);

// --- Blind Judging Route (judge | admin) ---
router.get('/:id/candidates-for-judging', protect, authorize('judge', 'admin'), getCandidatesForBlindJudging);

module.exports = router;
