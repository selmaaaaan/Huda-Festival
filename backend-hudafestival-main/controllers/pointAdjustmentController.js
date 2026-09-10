const PointAdjustment = require('../models/PointAdjustment');
const Team = require('../models/Team');
const Candidate = require('../models/Candidate');

const createAdjustment = async (req, res) => {
    try {
        const { appliesTo, teamId, candidateId, type, points, reason, remarks } = req.body;
        
        const adjustment = new PointAdjustment({
            appliesTo,
            team: appliesTo === 'team' ? teamId : undefined,
            candidate: appliesTo === 'candidate' ? candidateId : undefined,
            type,
            points: Number(points),
            reason,
            remarks,
            adjustedBy: req.user ? req.user._id : undefined
        });

        await adjustment.save();

        const pointChange = type === 'add' ? Number(points) : -Number(points);

        if (appliesTo === 'team') {
            await Team.findByIdAndUpdate(teamId, { $inc: { totalPoints: pointChange } });
        } else if (appliesTo === 'candidate') {
            const candidate = await Candidate.findByIdAndUpdate(candidateId, { $inc: { totalPoints: pointChange } });
            if (candidate && candidate.team) {
                await Team.findByIdAndUpdate(candidate.team, { $inc: { totalPoints: pointChange } });
            }
        }

        res.status(201).json(adjustment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to createAdjustment', error: error.message || 'Unknown error' });
    }
};

const getAllAdjustments = async (req, res) => {
    try {
        const adjustments = await PointAdjustment.find()
            .populate('team', 'name')
            .populate('candidate', 'name admissionNo')
            .populate('adjustedBy', 'userName')
            .sort({ createdAt: -1 });
        res.status(200).json(adjustments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to getAllAdjustments', error: error.message || 'Unknown error' });
    }
};

const deleteAdjustment = async (req, res) => {
    try {
        const { id } = req.params;
        const adjustment = await PointAdjustment.findById(id);
        
        if (!adjustment) {
            return res.status(404).json({ message: 'Adjustment not found' });
        }

        const pointChange = adjustment.type === 'add' ? -adjustment.points : adjustment.points;

        if (adjustment.appliesTo === 'team') {
            await Team.findByIdAndUpdate(adjustment.team, { $inc: { totalPoints: pointChange } });
        } else if (adjustment.appliesTo === 'candidate') {
            const candidate = await Candidate.findByIdAndUpdate(adjustment.candidate, { $inc: { totalPoints: pointChange } });
            if (candidate && candidate.team) {
                await Team.findByIdAndUpdate(candidate.team, { $inc: { totalPoints: pointChange } });
            }
        }

        await PointAdjustment.findByIdAndDelete(id);
        res.status(200).json({ message: 'Adjustment deleted and points reverted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to deleteAdjustment', error: error.message || 'Unknown error' });
    }
};

module.exports = {
    createAdjustment,
    getAllAdjustments,
    deleteAdjustment
};
