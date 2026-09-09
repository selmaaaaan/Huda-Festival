const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { importProgrammes, importRoster, uploadBylaw, getBylawUrl } = require('../controllers/importController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/programmes', protect, authorize('admin'), upload.fields([{ name: 'stage' }, { name: 'nonstage' }]), importProgrammes);
router.post('/roster', protect, authorize('admin'), upload.single('roster'), importRoster);
router.post('/bylaw-document', protect, authorize('admin'), upload.single('bylaw'), uploadBylaw);
router.get('/bylaw-document', protect, getBylawUrl);

module.exports = router;
