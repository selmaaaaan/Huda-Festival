const Programme = require('../models/Programme');
const { logAction } = require('../utils/logAction');
const Result = require('../models/Result');
const Team = require('../models/Team');
const Candidate = require('../models/Candidate');

// @desc Create a new programme
// @route POST /api/programmes
// @access Private/Admin
const createProgramme = async (req, res) => {
    const { name, type, date, category, code, stageType, participantsRaw } = req.body;
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body is missing' });
    }
    
    // Check specific fields and return explicit error messages
    if (!name) return res.status(400).json({ message: 'Please provide programme name' });
    if (!type) return res.status(400).json({ message: 'Please provide programme type' });
    if (!date) return res.status(400).json({ message: 'Please provide programme date' });
    if (!category) return res.status(400).json({ message: 'Please provide programme category' });
    if (!code) return res.status(400).json({ message: 'Please provide programme code' });
    if (!stageType) return res.status(400).json({ message: 'Please provide programme stageType' });
    if (!participantsRaw) return res.status(400).json({ message: 'Please provide programme participantsRaw' });

    try {
        const newProgramme = new Programme({
            name,
            type,
            date,
            category,
            code,
            stageType,
            participantsRaw
        });
       
        const savedProgramme = await newProgramme.save();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'PROGRAMME_CREATED', entityType: 'Programme', entityId: savedProgramme._id, details: { name: savedProgramme.name }, req });
        res.status(201).json(savedProgramme);
    }
    catch (error) {
        console.error(`Error while creating programme: ${error.message}`);
        res.status(500).json({ message: 'Failed to createProgramme', error: error.message || 'Unknown error' })
    }
}

// @desc Get all programmes
// @route GET /api/programmes
// @access Public
const getAllProgrammes = async (req, res) => {
    try {
        let filter = {};
        if (req.query.search) {
            const regex = new RegExp(req.query.search, 'i');
            filter = {
                $or: [
                    { name: regex },
                    { code: regex },
                    { category: regex }
                ]
            };
        }
        const programmes = await Programme.find(filter);
        res.status(200).json(programmes)
    }
    catch (error) {
        console.error(`Error while fetching programmes: ${error.message}`);
        res.status(500).json({ message: 'Failed to getAllProgrammes', error: error.message || 'Unknown error' });
    }
}

// @desc Get programme by ID 
// @route GET /api/programmes
// @access Public 
const getProgrammeById = async (req, res) => {
    try {
        const programme = await Programme.findById(req.params.id);
        if(programme) {
            res.status(200).json(programme);
        } else {
            res.status(404).json({ message: 'Programme not found'});
        }
    }
    catch (error) {
        console.error(`Error while fetching programme by ID: ${error.message}`);
        res.status(500).json({ message: 'Failed to getProgrammeById', error: error.message || 'Unknown error' });
    }
}

// @desc Update a programme
// @route PUT /api/programmes/:id
// @access Private/Admin
const updateProgramme = async (req,res) => {
    const { name, type, category, code, stageType, participantsRaw, format, isStarred } = req.body;
    try {
        const programme = await Programme.findById(req.params.id);
        if(!programme) {
            return res.status(404).json({ message: 'Programme not found'});
        }

        if (name !== undefined) programme.name = name;
        if (type !== undefined) programme.type = type;
        if (category !== undefined) programme.category = category;
        if (code !== undefined) programme.code = code;
        if (stageType !== undefined) programme.stageType = stageType;
        if (participantsRaw !== undefined) programme.participantsRaw = participantsRaw;
        if (format !== undefined) programme.format = format;
        if (isStarred !== undefined) programme.isStarred = isStarred;

        const updatedProgramme = await programme.save();
        res.status(200).json(updatedProgramme);

    }
    catch (error) {
        console.error(`Error while updating programme: ${error.message}`);
        res.status(500).json({ message: 'Failed to updateProgramme', error: error.message || 'Unknown error' });
    }
}

// @desc Delete a programme 
// @route DELETE /api/programmes/:id
// @access Private/Admin
const deleteProgramme = async (req, res) => {
    try {
        const programme = await Programme.findById(req.params.id);
        if(!programme) {
            return res.status(404).json({ message: 'Programme not found'});
        }

        const approvedResults = await Result.find({ programme: programme._id, status: 'approved' }).populate('candidate');

        for (const result of approvedResults) {
            if (result.candidate) {
                const candidate = result.candidate;
                candidate.totalPoints -= result.totalPoints;
                await candidate.save();

                if (candidate.team) {
                    const team = await Team.findById(candidate.team);
                    if (team) {
                        team.totalPoints -= result.totalPoints;
                        await team.save();
                    }
                }
            }
        }
        
        await Result.deleteMany({ programme: programme._id });

        await programme.deleteOne();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'PROGRAMME_DELETED', entityType: 'Programme', entityId: programme._id, details: { name: programme.name }, req });
        res.status(200).json({ message: 'Programme removed successfully'});
    }
    catch (error) {
        console.error(`Error while deleting programme: ${error.message}`);
        res.status(500).json({ message: 'Failed to deleteProgramme', error: error.message || 'Unknown error' });
    }
}


const Registration = require('../models/Registration');
const getProgrammeByCodeForJudging = async (req, res) => {
    try {
        const { code } = req.params;
        const programme = await Programme.findOne({ code });
        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }

        const registrations = await Registration.find({ programme: programme._id, status: 'approved' })
            .populate('candidates', 'name admissionNo')
            .populate('team', 'name');

        res.status(200).json({ programme, registrations });
    } catch (error) {
        console.error('Error in getProgrammeByCodeForJudging:', error);
        res.status(500).json({ message: 'Failed to fetch programme for judging', error: error.message });
    }
};

const updateTopicSettings = async (req, res) => {
    try {
        const { topicMode, topicList } = req.body;
        const programme = await Programme.findById(req.params.id);
        if (!programme) {
            return res.status(404).json({ message: 'Programme not found' });
        }
        
        if (topicMode !== undefined) programme.topicMode = topicMode;
        if (topicList !== undefined) programme.topicList = topicList;

        const updatedProgramme = await programme.save();
        res.status(200).json(updatedProgramme);
    } catch (error) {
        console.error(`Error while updating topic settings: ${error.message}`);
        res.status(500).json({ message: 'Failed to updateTopicSettings', error: error.message || 'Unknown error' });
    }
}

module.exports = {
    getProgrammeByCodeForJudging,
    createProgramme,
    getAllProgrammes,
    getProgrammeById,
    updateProgramme,
    deleteProgramme,
    updateTopicSettings
}