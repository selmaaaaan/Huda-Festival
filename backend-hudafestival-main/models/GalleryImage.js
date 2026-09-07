const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        required: false,
    },
    day: {
        type: String,
        required: false,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { timestamps: true });

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);
module.exports = GalleryImage;
