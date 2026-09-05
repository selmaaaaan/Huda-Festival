const User = require('../models/User');
const generateToken = require('../utils/generateToken')

// @desc Setup admin
// @route POST /api/auth/signup
// @access Private/Admin 
const registerAdmin = async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return res.status(400).json({ message: 'Please provide every details'})
    }
    try {
        const userExist = await User.findOne({ userName })
        if (userExist) {
            return res.status(400).json({ message: 'User already exist'})
        }

        const user = await User.create({
            userName,
            password,
            role: req.body.role || 'admin'
        })
        if (user) {
            res.status(201).json({
                _id: user._id,
                userName: user.userName,
                role: user.role,
                token: generateToken(user._id, user.role),
            })
        } else {
            res.status(400).json({ message: 'Invalid user data'});
        }
    }
    catch (error) {
        console.error(`Error while registering admin ${error.message}`);
        res.status(500).json({ message: 'Server Error'})
    }
}

// @desc Auth user & get token
// @route POST /api/auth/login
// @access Public
const loginAdmin = async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await User.findOne({ userName });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                userName: user.userName,
                role: user.role,
                token: generateToken(user._id, user.role),
            })
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error(`Error while login in admin ${error.message}`);
        res.status(500).json({ message: 'Server Error'})
    }
}

module.exports = {
    loginAdmin,
}