const Team = require('../models/Team');
const Programme = require('../models/Programme');
const Registration = require('../models/Registration');
const TopicRegistration = require('../models/TopicRegistration');
const Result = require('../models/Result');

const getDashboardProgress = async (req, res) => {
    try {
        const teams = await Team.find();
        const numTeams = teams.length;
        const programmes = await Programme.find();
        let expectedRegistrations = 0;
        let expectedTopics = 0;
        programmes.forEach(p => {
            expectedRegistrations += (p.maxParticipants || 1) * numTeams;
            if (p.topicMode && p.topicMode !== 'none') {
                expectedTopics += (p.maxParticipants || 1) * numTeams;
            }
        });
        const totalRegistrations = await Registration.countDocuments({ status: { '$in': ['approved', 'pending'] } });
        const totalTopics = await TopicRegistration.countDocuments({ status: { '$in': ['approved', 'pending'] } });
        const distinctResultProgrammes = await Result.distinct('programme');
        const valuatedCount = distinctResultProgrammes.length;
        const totalProgrammes = programmes.length;
        const publishedCount = programmes.filter(p => p.isResultPublished).length;

        const teamWiseProgress = [];
        for (const t of teams) {
            const teamRegCount = await Registration.countDocuments({ team: t._id, status: { '$in': ['approved', 'pending'] } });
            const teamTopicCount = await TopicRegistration.countDocuments({ team: t._id, status: { '$in': ['approved', 'pending'] } });
            const teamExpectedReg = expectedRegistrations / (numTeams || 1);
            const teamExpectedTop = expectedTopics / (numTeams || 1);
            teamWiseProgress.push({
                teamId: t._id,
                teamName: t.name,
                teamColor: t.color,
                registration: {
                    completed: teamRegCount,
                    total: teamExpectedReg,
                    percentage: teamExpectedReg > 0 ? Math.min(100, Math.round((teamRegCount / teamExpectedReg) * 100)) : 0
                },
                topic: {
                    completed: teamTopicCount,
                    total: teamExpectedTop,
                    percentage: teamExpectedTop > 0 ? Math.min(100, Math.round((teamTopicCount / teamExpectedTop) * 100)) : 0
                }
            });
        }

        res.status(200).json({
            registration: {
                completed: totalRegistrations,
                total: expectedRegistrations,
                percentage: expectedRegistrations > 0 ? Math.min(100, Math.round((totalRegistrations / expectedRegistrations) * 100)) : 0
            },
            topic: {
                completed: totalTopics,
                total: expectedTopics,
                percentage: expectedTopics > 0 ? Math.min(100, Math.round((totalTopics / expectedTopics) * 100)) : 0
            },
            valuated: {
                completed: valuatedCount,
                total: totalProgrammes,
                percentage: totalProgrammes > 0 ? Math.round((valuatedCount / totalProgrammes) * 100) : 0
            },
            published: {
                completed: publishedCount,
                total: totalProgrammes,
                percentage: totalProgrammes > 0 ? Math.round((publishedCount / totalProgrammes) * 100) : 0
            },
            teamWise: teamWiseProgress
        });
    } catch(err) {
        res.status(500).json({ message: 'Error fetching progress', error: err.message });
    }
};
