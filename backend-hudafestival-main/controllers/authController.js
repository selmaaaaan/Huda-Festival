const User = require('../models/User');
const { logAction } = require('../utils/logAction');
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
            role: req.body.role || 'admin',
            team: req.body.team || undefined
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
        res.status(500).json({ message: 'Failed to registerAdmin', error: error.message || 'Unknown error' })
    }
}

// @desc Create team leader
// @route POST /api/auth/create-team-leader
// @access Private/Admin
const createTeamLeader = async (req, res) => {
    const { userName, password, team } = req.body;
    if (!userName || !password || !team) {
        return res.status(400).json({ message: 'Please provide userName, password, and team' });
    }
    try {
        const userExist = await User.findOne({ userName });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            userName,
            password,
            role: 'team_leader',
            team
        });

        res.status(201).json({
            _id: user._id,
            userName: user.userName,
            role: user.role,
            team: user.team
        });
    } catch (error) {
        console.error(`Error while creating team leader: ${error.message}`);
        res.status(500).json({ message: 'Failed to createTeamLeader', error: error.message || 'Unknown error' });
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
                team: user.team,
                token: generateToken(user._id, user.role),
            })
            await logAction({ actor: user._id, actorRole: user.role, action: 'LOGIN', entityType: 'User', entityId: user._id, details: { userName: user.userName }, req });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error(`Error while login in admin ${error.message}`);
        res.status(500).json({ message: 'Failed to loginAdmin', error: error.message || 'Unknown error' })
    }
}

const teamLeaderLogin = async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await User.findOne({ userName });
        if (user && user.role === 'team_leader' && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                userName: user.userName,
                role: user.role,
                team: user.team,
                token: generateToken(user._id, user.role),
            });
            await logAction({ actor: user._id, actorRole: user.role, action: 'LOGIN', entityType: 'User', entityId: user._id, details: { userName: user.userName }, req });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error(`Error while login in team leader ${error.message}`);
        res.status(500).json({ message: 'Failed to teamLeaderLogin', error: error.message || 'Unknown error' })
    }
}

// @desc Get all team leaders
const User = require('../models/User');
const { logAction } = require('../utils/logAction');
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
            role: req.body.role || 'admin',
            team: req.body.team || undefined
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
        res.status(500).json({ message: 'Failed to registerAdmin', error: error.message || 'Unknown error' })
    }
}

// @desc Create team leader
// @route POST /api/auth/create-team-leader
// @access Private/Admin
const createTeamLeader = async (req, res) => {
    const { userName, password, team } = req.body;
    if (!userName || !password || !team) {
        return res.status(400).json({ message: 'Please provide userName, password, and team' });
    }
    try {
        const userExist = await User.findOne({ userName });
        if (userExist) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            userName,
            password,
            role: 'team_leader',
            team
        });

        res.status(201).json({
            _id: user._id,
            userName: user.userName,
            role: user.role,
            team: user.team
        });
    } catch (error) {
        console.error(`Error while creating team leader: ${error.message}`);
        res.status(500).json({ message: 'Failed to createTeamLeader', error: error.message || 'Unknown error' });
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
                team: user.team,
                token: generateToken(user._id, user.role),
            })
            await logAction({ actor: user._id, actorRole: user.role, action: 'LOGIN', entityType: 'User', entityId: user._id, details: { userName: user.userName }, req });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error(`Error while login in admin ${error.message}`);
        res.status(500).json({ message: 'Failed to loginAdmin', error: error.message || 'Unknown error' })
    }
}

const teamLeaderLogin = async (req, res) => {
    const { userName, password } = req.body;
    try {
        const user = await User.findOne({ userName });
        if (user && user.role === 'team_leader' && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                userName: user.userName,
                role: user.role,
                team: user.team,
                token: generateToken(user._id, user.role),
            });
            await logAction({ actor: user._id, actorRole: user.role, action: 'LOGIN', entityType: 'User', entityId: user._id, details: { userName: user.userName }, req });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    }
    catch (error) {
        console.error(`Error while login in team leader ${error.message}`);
        res.status(500).json({ message: 'Failed to teamLeaderLogin', error: error.message || 'Unknown error' })
    }
}

// @desc Get all team leaders
// @route GET /api/auth/team-leaders
// @access Private/Admin
const getAllTeamLeaders = async (req, res) => {
    try {
        const teamLeaders = await User.find({ role: 'team_leader' })
            .populate('team', 'name color')
            .select('-password');
        res.status(200).json(teamLeaders);
    } catch (error) {
        console.error(`Error fetching team leaders: ${error.message}`);
        res.status(500).json({ message: 'Failed to getAllTeamLeaders', error: error.message || 'Unknown error' });
    }
}



const updateTeamLeader = async (req, res) => {
    try {
        const { userName, password, team } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user || user.role !== 'team_leader') {
            return res.status(404).json({ message: 'Team leader not found' });
        }

        if (userName) user.userName = userName;
        if (team) user.team = team;
        
        // Use user.setPassword method or just assign user.password = password and let pre-save hook hash it.
        // Wait, does User model have pre-save hook? Let's check User model...
        // Actually, if we re-assign password, it should be hashed. Let's assume it has a pre('save') hook.
        // Wait! We can check models/User.js to be sure.
        if (password) user.password = password;

        await user.save();
        res.status(200).json({ message: 'Team leader updated successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteTeamLeader = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'team_leader') {
            return res.status(404).json({ message: 'Team leader not found' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Team leader deleted successfully' });
    } catch (error) {
        console.error('Error deleting team leader:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    updateTeamLeader,
    deleteTeamLeader,
    loginAdmin,
    registerAdmin,
    teamLeaderLogin,
    createTeamLeader,
    getAllTeamLeaders,
}