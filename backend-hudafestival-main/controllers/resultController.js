const Result = require('../models/Result.js');
const Programme = require('../models/Programme.js');
const Candidate = require('../models/Candidate.js');
const Team = require('../models/Team.js');
const Settings = require('../models/Settings.js');

const rankPointsMap = {
    'Stage': { 1: 5, 2: 3, 3: 1 }, 'Non-Stage': { 1: 5, 2: 3, 3: 1 },
    'Starred': { 1: 7, 2: 5, 3: 3 }, 'Group': { 1: 7, 2: 5, 3: 3 },
    'General': { 1: 10, 2: 7, 3: 5 }, 'Special': { 1: 15, 2: 10, 3: 7 },
};

// @desc    Save results as 'pending'
const savePendingResults = async (req, res) => {
    const { results } = req.body;
    const { id: programmeId } = req.params;
    try {
        for (const resultData of results) {
            const { candidateId, rank, grade } = resultData;
            // THE FIX: Explicitly reset points and set status on every save.
            // This prevents old 'approved' results from being stuck.
            await Result.findOneAndUpdate(
                { programme: programmeId, candidate: candidateId },
                { 
                    rank: rank || null, 
                    grade: grade || null, 
                    status: 'pending',
                    pointsFromRank: 0,
                    pointsFromGrade: 0,
                    totalPoints: 0
                },
                { upsert: true, new: true }
            );
        }
        res.status(201).json({ message: 'Results saved as pending.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while saving pending results.' });
    }
};

// @desc    Approve pending results and calculate points
const approvePendingResults = async (req, res) => {
    const { id: programmeId } = req.params;
    try {
        const programme = await Programme.findById(programmeId);
        if (!programme) return res.status(404).json({ message: 'Programme not found' });

        const pendingResults = await Result.find({ programme: programmeId, status: 'pending' });
        if (pendingResults.length === 0) {
            return res.status(400).json({ message: 'No pending results to approve for this programme.' });
        }
        
        let settings = await Settings.findOne();
        if (!settings) settings = await new Settings().save();
        const gradePointsMap = settings.gradePoints;

        for (const result of pendingResults) {
            const pointsFromRank = result.rank ? (rankPointsMap[programme.type]?.[result.rank] || 0) : 0;
            const pointsFromGrade = result.grade ? (gradePointsMap.get(result.grade) || 0) : 0;
            const totalPoints = pointsFromRank + pointsFromGrade;

            result.pointsFromRank = pointsFromRank;
            result.pointsFromGrade = pointsFromGrade;
            result.totalPoints = totalPoints;
            result.status = 'approved';
            await result.save();

            await Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: totalPoints } });
            const candidate = await Candidate.findById(result.candidate);
            if (candidate) {
                 await Team.updateOne({ _id: candidate.team }, { $inc: { totalPoints: totalPoints } });
            }
        }
        
        programme.isResultPublished = true;
        await programme.save();
        res.status(200).json({ message: 'Results approved and published successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while approving results.' });
    }
};

// @desc    Get all results for a specific programme
const getProgrammeResults = async (req, res) => {
    try {
        const results = await Result.find({ programme: req.params.id });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Bulk upsert results as 'pending'
const savePendingResultsBulk = async (req, res) => {
    const { results } = req.body; // Array of { candidateId, rank, grade }
    const { id: programmeId } = req.params;
    
    if (!Array.isArray(results)) {
        return res.status(400).json({ message: 'Results must be an array.' });
    }

    try {
        const bulkOps = results.map(resultData => ({
            updateOne: {
                filter: { programme: programmeId, candidate: resultData.candidateId },
                update: {
                    $set: {
                        rank: resultData.rank || null,
                        grade: resultData.grade || null,
                        status: 'pending',
                        pointsFromRank: 0,
                        pointsFromGrade: 0,
                        totalPoints: 0
                    }
                },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await Result.bulkWrite(bulkOps);
        }
        
        res.status(201).json({ message: 'Results saved as pending in bulk.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while saving bulk pending results.' });
    }
};

module.exports = { savePendingResults, savePendingResultsBulk, approvePendingResults, getProgrammeResults };
