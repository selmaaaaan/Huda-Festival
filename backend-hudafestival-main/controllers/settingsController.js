const Programme = require('../models/Programme');
const Team = require('../models/Team');
const Registration = require('../models/Registration');
const TopicRegistration = require('../models/TopicRegistration');
const Result = require('../models/Result');
const Settings = require('../models/Settings');

const getDashboardProgress = async (req, res) => {
    try {
        const teams = await Team.find().lean();
        const numTeams = teams.length || 1;
        const programmes = await Programme.find().lean();
        
        const allRegistrations = await Registration.find({ status: { '$in': ['approved', 'pending'] } }).lean();
        const allTopics = await TopicRegistration.find({ status: { '$in': ['approved', 'pending'] } }).lean();
        const allResults = await Result.find().lean();

        // Map programmes by ID for quick lookup
        const progMap = {};
        const categories = [...new Set(programmes.map(p => p.category))];
        
        programmes.forEach(p => {
            progMap[p._id.toString()] = p;
        });

        // Global Aggregation
        let globalExpectedReg = 0;
        let globalExpectedTop = 0;
        let globalTotalProgrammes = programmes.length;
        let globalPublishedCount = programmes.filter(p => p.isResultPublished).length;
        
        const distinctResultProgrammes = [...new Set(allResults.map(r => r.programme.toString()))];
        let globalValuatedCount = distinctResultProgrammes.length;

        // Category-wise global aggregation
        const categoryGlobal = {};
        categories.forEach(cat => {
            categoryGlobal[cat] = {
                expectedReg: 0,
                expectedTop: 0,
                totalProgrammes: 0,
                publishedCount: 0,
                valuatedCount: 0,
                regCompleted: 0,
                topCompleted: 0,
            };
        });

        programmes.forEach(p => {
            const cat = p.category;
            const expectedR = (p.maxParticipants || 1) * numTeams;
            let expectedT = 0;
            if (p.topicMode && p.topicMode !== 'none') {
                expectedT = (p.maxParticipants || 1) * numTeams;
            }
            
            globalExpectedReg += expectedR;
            globalExpectedTop += expectedT;
            
            if (categoryGlobal[cat]) {
                categoryGlobal[cat].expectedReg += expectedR;
                categoryGlobal[cat].expectedTop += expectedT;
                categoryGlobal[cat].totalProgrammes += 1;
                if (p.isResultPublished) categoryGlobal[cat].publishedCount += 1;
                if (distinctResultProgrammes.includes(p._id.toString())) categoryGlobal[cat].valuatedCount += 1;
            }
        });

                const TEAM_QUOTAS = {
    'BID\u0100YAH': 9,
    '\u02BE\u016AL\u0100': 9,
    'TH\u0100NIYAH': 9,
    'TH\u0100NAWIYYAH': 11,
    '\u02BF\u0100LIYAH': 9
};

        // Override Expected Reg based on hard quotas
        globalExpectedReg = 0;
        categories.forEach(cat => {
            const rawPerTeam = categoryGlobal[cat].expectedReg / numTeams;
            const quotaPerTeam = TEAM_QUOTAS[cat] || rawPerTeam;
            categoryGlobal[cat].expectedReg = quotaPerTeam * numTeams;
            globalExpectedReg += categoryGlobal[cat].expectedReg;
        });

        // Process Registrations
        allRegistrations.forEach(r => {
            const p = progMap[r.programme?.toString()];
            if (p && categoryGlobal[p.category]) {
                const add = 1;
                categoryGlobal[p.category].regCompleted += add;
            }
        });

        // Process Topics
        allTopics.forEach(t => {
            const p = progMap[t.programme?.toString()];
            if (p && categoryGlobal[p.category]) {
                categoryGlobal[p.category].topCompleted += 1;
            }
        });

        const globalRegCompleted = allRegistrations.length;
        const globalTopCompleted = allTopics.length;

        // Compile global response
        const globalCategoryResponse = categories.map(cat => {
            const cg = categoryGlobal[cat];
            return {
                category: cat,
                registration: {
                    completed: cg.regCompleted,
                    total: cg.expectedReg,
                    percentage: cg.expectedReg > 0 ? Math.min(100, Math.round((cg.regCompleted / cg.expectedReg) * 100)) : 0
                },
                topic: {
                    completed: cg.topCompleted,
                    total: cg.expectedTop,
                    percentage: cg.expectedTop > 0 ? Math.min(100, Math.round((cg.topCompleted / cg.expectedTop) * 100)) : 0
                },
                valuated: {
                    completed: cg.valuatedCount,
                    total: cg.totalProgrammes,
                    percentage: cg.totalProgrammes > 0 ? Math.round((cg.valuatedCount / cg.totalProgrammes) * 100) : 0
                },
                published: {
                    completed: cg.publishedCount,
                    total: cg.totalProgrammes,
                    percentage: cg.totalProgrammes > 0 ? Math.round((cg.publishedCount / cg.totalProgrammes) * 100) : 0
                }
            };
        });

        // Team-wise Aggregation
        const teamWiseProgress = teams.map(t => {
            const teamIdStr = t._id.toString();
            
            // Team total expected (same for every team)
            const teamExpectedReg = globalExpectedReg / numTeams;
            const teamExpectedTop = globalExpectedTop / numTeams;
            
            const teamRegs = allRegistrations.filter(r => r.team?.toString() === teamIdStr);
            const teamTops = allTopics.filter(r => r.team?.toString() === teamIdStr);
            
            const teamRegCount = teamRegs.length;
            const teamTopicCount = teamTops.length;

            const categoryProgress = categories.map(cat => {
                const cg = categoryGlobal[cat];
                const catTeamExpectedReg = cg.expectedReg / numTeams;
                const catTeamExpectedTop = cg.expectedTop / numTeams;
                
                const catTeamRegs = teamRegs.filter(r => {
                    const p = progMap[r.programme?.toString()];
                    return p && p.category === cat;
                });
                const catTeamTops = teamTops.filter(r => {
                    const p = progMap[r.programme?.toString()];
                    return p && p.category === cat;
                });
                
                const catTeamRegCount = catTeamRegs.length;
                const catTeamTopCount = catTeamTops.length;
                
                return {
                    category: cat,
                    registration: {
                        completed: catTeamRegCount,
                        total: catTeamExpectedReg,
                        percentage: catTeamExpectedReg > 0 ? Math.min(100, Math.round((catTeamRegCount / catTeamExpectedReg) * 100)) : 0
                    },
                    topic: {
                        completed: catTeamTopCount,
                        total: catTeamExpectedTop,
                        percentage: catTeamExpectedTop > 0 ? Math.min(100, Math.round((catTeamTopCount / catTeamExpectedTop) * 100)) : 0
                    }
                };
            });

            return {
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
                },
                categoryProgress
            };
        });

        res.status(200).json({
            registration: {
                completed: globalRegCompleted,
                total: globalExpectedReg,
                percentage: globalExpectedReg > 0 ? Math.min(100, Math.round((globalRegCompleted / globalExpectedReg) * 100)) : 0
            },
            topic: {
                completed: globalTopCompleted,
                total: globalExpectedTop,
                percentage: globalExpectedTop > 0 ? Math.min(100, Math.round((globalTopCompleted / globalExpectedTop) * 100)) : 0
            },
            valuated: {
                completed: globalValuatedCount,
                total: globalTotalProgrammes,
                percentage: globalTotalProgrammes > 0 ? Math.round((globalValuatedCount / globalTotalProgrammes) * 100) : 0
            },
            published: {
                completed: globalPublishedCount,
                total: globalTotalProgrammes,
                percentage: globalTotalProgrammes > 0 ? Math.round((globalPublishedCount / globalTotalProgrammes) * 100) : 0
            },
            categoryWise: globalCategoryResponse,
            teamWise: teamWiseProgress
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching progress', error: err.message });
    }
};

const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.status(200).json(settings);
    } catch (error) {
        console.error(`Error while get settings ${error.message}`);
        res.status(500).json({ message: 'Failed to getSettings', error: error.message || 'Unknown error' });
    }
}

const updateSettings = async (req, res) => {
    const { gradePoints, isRegistrationOpen, categoryRegistrationStatus, maintenanceMode, maintenanceMessage, topicRegistrationEnabled, venues } = req.body;

    try {
        let settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: "Settings not found. Cannot update settings."})
        }

        if (gradePoints) {
            settings.gradePoints = new Map(Object.entries(gradePoints));
        }
        if (typeof isRegistrationOpen !== 'undefined') {
            settings.isRegistrationOpen = isRegistrationOpen;
        }
        if (categoryRegistrationStatus) {
            settings.categoryRegistrationStatus = new Map(Object.entries(categoryRegistrationStatus));
        }
        if (typeof topicRegistrationEnabled !== 'undefined') {
            settings.topicRegistrationEnabled = topicRegistrationEnabled;
        }
        if (typeof maintenanceMode !== 'undefined') {
            settings.maintenanceMode = maintenanceMode;
        }
        if (typeof maintenanceMessage !== 'undefined') {
            settings.maintenanceMessage = maintenanceMessage;
        }
        if (venues !== undefined) {
            settings.venues = venues;
        }

        const updatedSettings = await settings.save();
        res.status(200).json(updatedSettings);
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