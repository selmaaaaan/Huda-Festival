const GalleryImage = require('../models/GalleryImage');
const cloudinary = require('cloudinary').v2;

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided' });
        }
        const { caption, day } = req.body;
        
        const newImage = new GalleryImage({
            url: req.file.path,
            publicId: req.file.filename,
            caption,
            day,
            uploadedBy: req.user._id
        });

        const savedImage = await newImage.save();
        res.status(201).json(savedImage);
    } catch (error) {
        console.error('Error uploading gallery image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllImages = async (req, res) => {
    try {
        const images = await GalleryImage.find().sort({ createdAt: -1 });
        res.status(200).json(images);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteImage = async (req, res) => {
    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        await cloudinary.uploader.destroy(image.publicId);
        await image.deleteOne();
        
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    uploadImage,
    getAllImages,
    deleteImage
};
