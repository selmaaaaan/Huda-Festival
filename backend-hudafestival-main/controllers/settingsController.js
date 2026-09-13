const Programme = require('../models/Programme'); const Team = require('../models/Team'); const Registration = require('../models/Registration'); const TopicRegistration = require('../models/TopicRegistration'); const Result = require('../models/Result'); const getDashboardProgress = async (req, res) => { try { const teams = await Team.find(); const numTeams = teams.length; const programmes = await Programme.find(); let expectedRegistrations = 0; let expectedTopics = 0; programmes.forEach(p => { expectedRegistrations += (p.maxParticipants || 1) * numTeams; if (p.topicMode && p.topicMode !== 'none') { expectedTopics += (p.maxParticipants || 1) * numTeams; } }); const totalRegistrations = await Registration.countDocuments({ status: { '$in': ['approved', 'pending'] } }); const totalTopics = await TopicRegistration.countDocuments({ status: { '$in': ['approved', 'pending'] } }); const distinctResultProgrammes = await Result.distinct('programme'); const valuatedCount = distinctResultProgrammes.length; const totalProgrammes = programmes.length; const publishedCount = programmes.filter(p => p.isResultPublished).length; res.status(200).json({ registration: { completed: totalRegistrations, total: expectedRegistrations, percentage: expectedRegistrations > 0 ? Math.min(100, Math.round((totalRegistrations / expectedRegistrations) * 100)) : 0 }, topic: { completed: totalTopics, total: expectedTopics, percentage: expectedTopics > 0 ? Math.min(100, Math.round((totalTopics / expectedTopics) * 100)) : 0 }, valuated: { completed: valuatedCount, total: totalProgrammes, percentage: totalProgrammes > 0 ? Math.round((valuatedCount / totalProgrammes) * 100) : 0 }, published: { completed: publishedCount, total: totalProgrammes, percentage: totalProgrammes > 0 ? Math.round((publishedCount / totalProgrammes) * 100) : 0 } }); } catch(err) { res.status(500).json({ message: 'Error fetching progress', error: err.message }); } }; 

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
        res.status(500).json({ message: 'Failed to getSettings', error: error.message || 'Unknown error' });
    }
}

const updateSettings = async (req, res) => {
    const { gradePoints, isRegistrationOpen, maintenanceMode, maintenanceMessage, topicRegistrationEnabled } = req.body;

    try {
        let settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: "Settings not found. Cannot update settings."})
        }

        if (gradePoints) {
            // Mongoose Maps can be updated directly like this
            settings.gradePoints = new Map(Object.entries(gradePoints));
        }
        
        if (typeof isRegistrationOpen !== 'undefined') {
            settings.isRegistrationOpen = isRegistrationOpen;
        }

        if (typeof maintenanceMode !== 'undefined') {
            settings.maintenanceMode = maintenanceMode;
        }

        if (typeof maintenanceMessage !== 'undefined') {
            settings.maintenanceMessage = maintenanceMessage;
        }

        if (req.body.venues !== undefined) {
            settings.venues = req.body.venues;
        }

        const updatedSettings = await settings.save();
        res.status(200).json(updatedSettings)
    }
    catch (error) {
        console.error(`Error while updating settings ${error.message}`);
        res.status(500).json({ message: 'Failed to updateSettings', error: error.message || 'Unknown error' })
    }
}

const getBylawRules = (req, res) => {
    const { POSITION_POINTS, GRADE_POINTS, CATEGORIES } = require('../config/bylawRules');
    res.status(200).json({ POSITION_POINTS, GRADE_POINTS, CATEGORIES });
};

module.exports = {
    getSettings,
    updateSettings,
    getBylawRules,
    getDashboardProgress,
}