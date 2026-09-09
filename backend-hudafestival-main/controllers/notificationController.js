const Notification = require('../models/Notification');

const createNotification = async (req, res) => {
    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        const newNotification = new Notification({
            title,
            body,
            createdBy: req.user._id
        });

        const savedNotification = await newNotification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Failed to createNotification', error: error.message || 'Unknown error' });
    }
};

const getActiveNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to getActiveNotifications', error: error.message || 'Unknown error' });
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).populate('createdBy', 'userName');
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching all notifications:', error);
        res.status(500).json({ message: 'Failed to getAllNotifications', error: error.message || 'Unknown error' });
    }
};

const toggleNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.isActive = !notification.isActive;
        await notification.save();
        
        res.status(200).json(notification);
    } catch (error) {
        console.error('Error toggling notification:', error);
        res.status(500).json({ message: 'Failed to toggleNotification', error: error.message || 'Unknown error' });
    }
};

module.exports = {
    createNotification,
    getActiveNotifications,
    getAllNotifications,
    toggleNotification
};
