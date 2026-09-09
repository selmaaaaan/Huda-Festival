const express = require('express');
const router = express.Router();
const {
  createProgramme, getAllProgrammes, getProgrammeById, updateProgramme, deleteProgramme, getProgrammeByCodeForJudging,
} = require('../controllers/programmeController.js');
const { approvePendingResults } = require('../controllers/resultController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const resultRouter = require('./resultRoutes.js');

// --- Main Programme Routes ---
// GET is now public, POST remains protected
router.get('/code/:code/judging', protect, getProgrammeByCodeForJudging);

router.route('/')
  .get(getAllProgrammes) // <-- FIX: 'protect' REMOVED
  .post(protect, createProgramme);

// --- Approve Route (Admin Only) ---
const { authorize } = require('../middlewares/authMiddleware.js');
const { publishBatch } = require('../controllers/resultController.js');

router.post('/publish-batch', protect, authorize('admin'), publishBatch);

router.route('/:id/approve')
  .post(protect, authorize('admin'), approvePendingResults);

// --- Nested Result Routes ---
router.use('/:id/results', resultRouter);

const { getProgrammeRegistrations } = require('../controllers/registrationController.js');
router.get('/:id/registrations', protect, getProgrammeRegistrations);

// --- Specific Programme Routes (by ID) ---
// GET is now public, PUT and DELETE remain protected
router.route('/:id')
  .get(getProgrammeById) // <-- FIX: 'protect' REMOVED
  .put(protect, authorize('admin'), updateProgramme)
  .delete(protect, authorize('admin'), deleteProgramme);

router.patch('/:id/topic-settings', protect, authorize('admin'), updateTopicSettings);

module.exports = router;
