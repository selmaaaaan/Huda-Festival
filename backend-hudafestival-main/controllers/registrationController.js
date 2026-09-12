const Registration = require('../models/Registration');
const Programme = require('../models/Programme');
const Candidate = require('../models/Candidate');
const Settings = require('../models/Settings');
const { logAction } = require('../utils/logAction');

const createRegistration = async (req, res) => {
    const { programmeId, teamId, candidateIds } = req.body;
    try {
        const settings = await Settings.findOne();
        if (settings && settings.isRegistrationOpen === false) {
            return res.status(403).json({ message: 'Registration is closed by Fest Admins' });
        }

        if (!programmeId || !teamId || !candidateIds || !Array.isArray(candidateIds)) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Team leader check
        if (req.user.role === 'team_leader' && req.user.team.toString() !== teamId) {
            return res.status(403).json({ message: 'Can only register for your own team' });
        }

        const programme = await Programme.findById(programmeId);
        if (!programme) return res.status(404).json({ message: 'Programme not found' });

        if (programme.format === 'Group') {
            if (candidateIds.length !== programme.groupSize) {
                return res.status(400).json({ message: `Group programme requires exactly ${programme.groupSize} candidates` });
            }
        } else {
            if (candidateIds.length !== 1) {
                return res.status(400).json({ message: 'Individual programme requires exactly 1 candidate' });
            }
        }

        const existingCount = await Registration.countDocuments({
            programme: programmeId,
            team: teamId,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingCount >= programme.maxParticipants) {
            return res.status(400).json({ message: 'Team has reached maximum participants for this programme' });
        }

        const candidates = await Candidate.find({ _id: { $in: candidateIds } });
        if (candidates.length !== candidateIds.length) {
            return res.status(400).json({ message: 'One or more candidates not found' });
        }

        for (const candidate of candidates) {
            if (candidate.team.toString() !== teamId) {
                return res.status(400).json({ message: `Candidate ${candidate.name} does not belong to the selected team` });
            }
        }

        const newRegistration = new Registration({
            programme: programmeId,
            team: teamId,
            candidates: candidateIds,
            status: 'pending',
            submittedBy: req.user._id,
        });

        const saved = await newRegistration.save();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'REGISTRATION_SUBMITTED', entityType: 'Registration', entityId: saved._id, details: { programmeId, teamId }, req });

        res.status(201).json(saved);
    } catch (error) {
        console.error('Error creating registration:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate registration for candidate' });
        }
        res.status(500).json({ message: 'Failed to createRegistration', error: error.message || 'Unknown error' });
    }
};

const getRegistrations = async (req, res) => {
    try {
        const { programme, team, status, page = 1, limit = 50 } = req.query;
        const filter = {};

        if (req.user.role === 'team_leader') {
            filter.team = req.user.team;
        } else if (team) {
            filter.team = team;
        }

        if (programme) filter.programme = programme;
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [registrations, total] = await Promise.all([
            Registration.find(filter)
                .populate('team', 'name')
                .populate('programme', 'name type category')
                .populate('candidates', 'name admissionNo')
                .populate('submittedBy', 'userName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Registration.countDocuments(filter)
        ]);

        res.status(200).json({
            registrations,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ message: 'Failed to getAllRegistrations', error: error.message || 'Unknown error' });
    }
};

const approveRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        registration.status = 'approved';
        registration.reviewedBy = req.user._id;
        registration.rejectionReason = null;
        await registration.save();

        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'REGISTRATION_APPROVED', entityType: 'Registration', entityId: registration._id, req });
        res.status(200).json(registration);
    } catch (error) {
        console.error('Error approving registration:', error);
        res.status(500).json({ message: 'Failed to approveRegistration', error: error.message || 'Unknown error' });
    }
};

const rejectRegistration = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        if (!rejectionReason) return res.status(400).json({ message: 'Rejection reason is required' });

        const registration = await Registration.findById(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        registration.status = 'rejected';
        registration.rejectionReason = rejectionReason;
        registration.reviewedBy = req.user._id;
        await registration.save();

        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'REGISTRATION_REJECTED', entityType: 'Registration', entityId: registration._id, details: { reason: rejectionReason }, req });
        res.status(200).json(registration);
    } catch (error) {
        console.error('Error rejecting registration:', error);
        res.status(500).json({ message: 'Failed to rejectRegistration', error: error.message || 'Unknown error' });
    }
};

const updateRegistration = async (req, res) => {
    try {
        const { candidateIds } = req.body;
        const registration = await Registration.findById(req.params.id).populate('programme');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        if (registration.status === 'approved') {
            return res.status(400).json({ message: 'Cannot update approved registration' });
        }

        if (candidateIds && Array.isArray(candidateIds)) {
            if (registration.programme.format === 'Group' && candidateIds.length !== registration.programme.groupSize) {
                return res.status(400).json({ message: `Group programme requires exactly ${registration.programme.groupSize} candidates` });
            } else if (registration.programme.format !== 'Group' && candidateIds.length !== 1) {
                return res.status(400).json({ message: 'Individual programme requires exactly 1 candidate' });
            }

            const candidates = await Candidate.find({ _id: { $in: candidateIds } });
            if (candidates.length !== candidateIds.length) {
                return res.status(400).json({ message: 'One or more candidates not found' });
            }
            for (const candidate of candidates) {
                if (candidate.team.toString() !== registration.team.toString()) {
                    return res.status(400).json({ message: `Candidate ${candidate.name} does not belong to the team` });
                }
            }
            registration.candidates = candidateIds;
        }

        const saved = await registration.save();
        res.status(200).json(saved);
    } catch (error) {
        console.error('Error updating registration:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate registration for candidate' });
        }
        res.status(500).json({ message: 'Failed to updateRegistration', error: error.message || 'Unknown error' });
    }
};

const deleteRegistration = async (req, res) => {
    try {
        const registration = await Registration.findByIdAndDelete(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        res.status(200).json({ message: 'Registration deleted' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ message: 'Failed to deleteRegistration', error: error.message || 'Unknown error' });
    }
};

const getProgrammeRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ programme: req.params.id, status: 'approved' })
            .populate('candidates', 'name admissionNo')
            .populate('team', 'name');
        res.status(200).json(registrations);
    } catch (error) {
        console.error('Error fetching programme registrations:', error);
        res.status(500).json({ message: 'Failed to getProgrammeRegistrations', error: error.message || 'Unknown error' });
    }
};

module.exports = {
    createRegistration,
    getRegistrations,
    approveRegistration,
    rejectRegistration,
    updateRegistration,
    deleteRegistration,
    getProgrammeRegistrations,
};
