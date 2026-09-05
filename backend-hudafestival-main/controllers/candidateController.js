const Candidate = require('../models/Candidate');
const Team = require('../models/Team');
const cloudinary = require('cloudinary').v2;
const Result = require('../models/Result');

// @desc Create a new candidate
// @route POST /api/candidates
// @access Public/Admin
const createCandidate = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Request body is missing' });
    }
    const { admissionNo, name, team, category } = req.body;

    try {
        const candidateExists = await Candidate.findOne({ admissionNo });
        if (candidateExists) {
            return res.status(400).json({message: 'Candidate with this admission number already exists'});
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload candidate image'});
        }

        const newCandidate = new Candidate({
            admissionNo,
            name,
            team, 
            category, 
            image: {
                url: req.file.path,
                public_id: req.file.filename,
            }
        });

        const savedCandidate = await newCandidate.save();
        res.status(201).json(savedCandidate);
    }
    catch (error) {
        console.error('Error creating candidate:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc Get all candidates
// @route GET /api/candidates
// @access Public
const getAllCandidates = async (req, res) => {
    try {
        const candidates = await Candidate.find({}).populate('team', 'name');
        res.status(200).json(candidates);
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Server error'});
    }
}

// @desc    Get a single candidate by ID
// @route   GET /api/candidates/:id
// @access  Public (for now)
const getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id).populate('team', 'name');
        if(candidate) {
            res.status(200).json(candidate);
        }  else {
            res.status(404).json({ message: 'Candidate not found'});
        }
    }
    catch (error) {
        console.error('Error fetching candidate by Id:', error);
        res.status(500).json({ message: 'Server error'});
    }
}

// @desc Update a candidate 
//  @route PUT /api/candidate/:id
// @access Private/Admin
const updateCandidate = async (req, res) => {
    const { admissionNo, name, team, category, isResultPublished} = req.body;
    try {
        const candidate = await Candidate.findById(req.params.id);
        if(!candidate) {
            return res.status(404).json({ message: 'Candidate not found'})
        }

        if(req.file) {
            await cloudinary.uploader.destroy(candidate.image.public_id);
            candidate.image.url =  req.file.path
            candidate.image.public_id = req.file.filename;
        }

        candidate.admissionNo = admissionNo || candidate.admissionNo;
        candidate.name = name || candidate.name;
        candidate.team = team || candidate.team;
        candidate.category = category || candidate.category;

        const updateCandidate = await candidate.save();
        res.status(200).json(updateCandidate);
    }
    catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ message: 'Server error'});
    }
}

// @desc Delete a candidate
// @route DELETE /api/candidates/:id
// @access Private/Admin

const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if(!candidate) {
            return res.status(404).json({ message: 'Candidate not found'});
        }

        const approvedResults = await Result.find({ candidate: candidate._id, status: 'approved' });
        if (approvedResults.length > 0 && candidate.team) {
            const team = await Team.findById(candidate.team);
            if (team) {
                const pointsToDeduct = approvedResults.reduce((acc, curr) => acc + curr.totalPoints, 0);
                team.totalPoints -= pointsToDeduct;
                await team.save();
            }
        }
        
        await Result.deleteMany({ candidate: candidate._id });

        await cloudinary.uploader.destroy(candidate.image.public_id);
        await candidate.deleteOne();

        res.status(200).json({ message: 'Candidate deleted successfully'});

    }
    catch(error) {
        console.error('Error deleting candidate: ', error);
        res.status(500).json({ message: 'Server error'});
    }
}

const addMinusPoints = async (req, res) => {
    const { points } = req.body;
    const { id: candidateId } = req.params;

    const pointsToDeduct = Number(points);
    if (!pointsToDeduct || pointsToDeduct <= 0) {
        return res.status(400).json({ message: "Please provide a valid number of point to deduct ! "})
    }
    try {
        const candidate = await Candidate.findById(candidateId);
        if(!candidate) {
            return res.status(404).json({ message: "Candidate not found"})
        }
        
        // Add to the candidate's minusPoints tracker
        candidate.minusPoints += pointsToDeduct;
        // Subtract from the candidate's totalPoints
        candidate.totalPoints -= pointsToDeduct;
        await candidate.save();

        // IMPORTANT: Also subtract the points from their team's total
        const team = await Team.findById(candidate.team)
        if (team) {
            team.totalPoints -= pointsToDeduct;
            await team.save();
        }

        res.status(200).json({ message: `${pointsToDeduct} points deducted successfully.`, candidate})
    }
    catch (error) {
        console.error(`Error while add minus points ${error.message}`);
        res.status(500).json({ message: 'Server Error'});
    }
}

// @desc Search for candidate
// @route GET /api/candidates/search
// @access Public
const searchCandidates = async (req, res) => {
    const searchTerm = req.query.term;
    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required' });
    }
    try {
        const candidates = await Candidate.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { admissionNo: { $regex: searchTerm, $options: 'i' } }
            ]
        }).populate('team', 'name');
        res.status(200).json(candidates);
    } catch (error) {
        console.error("Error searching candidates:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- THIS IS THE NEW FUNCTION ---
// @desc    Get all results for a specific candidate
// @route   GET /api/candidates/:id/results
// @access  Public
const getCandidateResults = async (req, res) => {
    try {
        const results = await Result.find({ candidate: req.params.id })
            .populate('programme', 'name'); // Get the programme name for each result

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching candidate results:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createCandidate, 
    getAllCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    addMinusPoints,
    searchCandidates,
    getCandidateResults,
}