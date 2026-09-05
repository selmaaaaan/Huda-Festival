const express = require('express');
const router = express.Router();
const {
  createProgramme, getAllProgrammes, getProgrammeById,
  updateProgramme, deleteProgramme,
} = require('../controllers/programmeController.js');
const { approvePendingResults } = require('../controllers/resultController.js');
const { protect } = require('../middlewares/authMiddleware.js');
const resultRouter = require('./resultRoutes.js');

// --- Main Programme Routes ---
// GET is now public, POST remains protected
router.route('/')
  .get(getAllProgrammes) // <-- FIX: 'protect' REMOVED
  .post(protect, createProgramme);

// --- Approve Route (Admin Only) ---
router.route('/:id/approve')
  .post(protect, approvePendingResults);

// --- Nested Result Routes ---
router.use('/:id/results', resultRouter);

// --- Specific Programme Routes (by ID) ---
// GET is now public, PUT and DELETE remain protected
router.route('/:id')
  .get(getProgrammeById) // <-- FIX: 'protect' REMOVED
  .put(protect, updateProgramme)
  .delete(protect, deleteProgramme);

module.exports = router;

