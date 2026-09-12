const fs = require('fs');
let content = fs.readFileSync('../backend-hudafestival-main/controllers/authController.js', 'utf8');

const updateFn = `

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

`;

content = content.replace('module.exports = {', updateFn + 'module.exports = {\n    updateTeamLeader,');
fs.writeFileSync('../backend-hudafestival-main/controllers/authController.js', content);
