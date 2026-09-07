const express = require('express');
const router = express.Router();
const { uploadImage, getAllImages, deleteImage } = require('../controllers/galleryController');
const galleryUpload = require('../config/galleryCloudinary');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .get(getAllImages)
    .post(protect, authorize('admin'), galleryUpload.single('image'), uploadImage);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteImage);

module.exports = router;
