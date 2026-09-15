const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('team', 'name zone');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { userName, password, role, team } = req.body;
        
        const userExists = await User.findOne({ userName });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userData = { userName, password, role };
        if (role === 'team_leader' && team) {
            userData.team = team;
        }

        const user = await User.create(userData);
        const savedUser = await User.findById(user._id).select('-password').populate('team', 'name zone');
        
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.isActive = req.body.isActive;
        // Don't trigger pre-save password hash if password isn't modified
        await user.save();
        
        const updatedUser = await User.findById(user._id).select('-password').populate('team', 'name zone');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status', error: error.message });
    }
};

module.exports = { getAllUsers, createUser, toggleUserStatus };
