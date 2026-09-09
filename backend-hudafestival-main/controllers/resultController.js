const Result = require('../models/Result.js');
const { logAction } = require('../utils/logAction');
const Programme = require('../models/Programme.js');
const Candidate = require('../models/Candidate.js');
const Team = require('../models/Team.js');
const Settings = require('../models/Settings.js');



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
        res.status(500).json({ message: 'Failed to savePendingResults', error: error.message || 'Unknown error' });
    }
};

const approveForProgramme = async (programmeId, user) => {
    const programme = await Programme.findById(programmeId);
    if (!programme) throw new Error(`Programme not found: ${programmeId}`);

    const pendingResults = await Result.find({ programme: programmeId, status: 'pending' });
    if (pendingResults.length === 0) {
        return { programmeId, success: false, message: 'No pending results to approve.' };
    }
    
    const { POSITION_POINTS, GRADE_POINTS } = require('../config/bylawRules');
    
    let tier = 'individual';
    if (programme.category === 'KULLIYYAH') {
        tier = 'kulliyyah';
    } else if (programme.isStarred) {
        tier = 'starred';
    } else if (programme.format === 'Group') {
        tier = 'group';
    }

    let gradeTier = (programme.isStarred || programme.format === 'Group' || programme.category === 'KULLIYYAH') ? 'starred' : 'standard';

    for (const result of pendingResults) {
        const pointsFromRank = result.rank ? (POSITION_POINTS[tier]?.[result.rank] || 0) : 0;
        const pointsFromGrade = result.grade ? (GRADE_POINTS[gradeTier]?.[result.grade] || 0) : 0;
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
    return { programmeId, success: true, count: pendingResults.length };
};

// @desc    Approve pending results and calculate points
const approvePendingResults = async (req, res) => {
    const { id: programmeId } = req.params;
    try {
        const result = await approveForProgramme(programmeId, req.user);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_PUBLISHED', entityType: 'Result', details: { programmeId }, req });
        res.status(200).json({ message: 'Results approved and published successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to approvePendingResults', error: error.message || 'Unknown error' });
    }
};

const publishBatch = async (req, res) => {
  const { programmeIds } = req.body;
  if (!Array.isArray(programmeIds) || programmeIds.length === 0) {
    return res.status(400).json({ message: 'programmeIds array is required' });
  }
  const results = [];
  try {
      for (const pid of programmeIds) {
        results.push(await approveForProgramme(pid, req.user));
      }
      await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_BULK_PUBLISHED', entityType: 'Result', details: { programmeIds, results }, req });
      res.status(200).json({ message: `Published ${programmeIds.length} programmes`, results });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to publishBatch', error: error.message || 'Unknown error' });
  }
};

// @desc    Get all results for a specific programme
const getProgrammeResults = async (req, res) => {
    try {
        const results = await Result.find({ programme: req.params.id });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to getProgrammeResults', error: error.message || 'Unknown error' });
    }
};

// @desc    Bulk upsert results as 'pending'
const savePendingResultsBulk = async (req, res) => {
    const { results, batchId } = req.body; // Array of { candidateId, rank, grade }
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
                        batchId: batchId || null,
                        submittedBy: req.user._id,
                        status: 'pending',
                        batchId: batchId || null,
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
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_SAVED', entityType: 'Result', details: { programmeId, count: results.length, batchId }, req });
        res.status(201).json({ message: 'Results saved as pending in bulk.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to savePendingResultsBulk', error: error.message || 'Unknown error' });
    }
};

module.exports = { savePendingResults, savePendingResultsBulk, approvePendingResults, getProgrammeResults, publishBatch };
