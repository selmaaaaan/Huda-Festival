const Settings = require('../models/Settings');

// @desc Get the current settings
// @route Get /api/settings
// @access Private/Admin
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // If none exists, create a default one for the first time.
            settings = new Settings();
            await settings.save();
        }

        res.status(200).json(settings);
    }
    catch (error) {
        console.error(`Error while get settings ${error.message}`);
        res.status(500).json({ message: "Server Error"});
    }
}

const updateSettings = async (req, res) => {
    const { gradePoints } = req.body;

    try {
        let settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: "Settings not found. Cannot update settings."})
        }

        if (gradePoints) {
            // Mongoose Maps can be updated directly like this
            settings.gradePoints = new Map(Object.entries(gradePoints));
        }

        const updatedSettings = await settings.save();
        res.status(200).json(updatedSettings)
    }
    catch (error) {
        console.error(`Error while updating settings ${error.message}`);
        res.status(500).json({ message: "Server Error"})
    }
}

module.exports = {
    getSettings,
    updateSettings,
}