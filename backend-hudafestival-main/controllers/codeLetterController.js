const CodeLetter = require('../models/CodeLetter');
const Registration = require('../models/Registration');

// @desc Bulk-assign code letters for a programme
// @route POST /api/programmes/:id/code-letters
// @access Private (admin | volunteer)
const bulkAssignCodeLetters = async (req, res) => {
    try {
        const { id: programmeId } = req.params;
        const { assignments } = req.body; // [{ candidateId, letter }]

        if (!Array.isArray(assignments) || assignments.length === 0) {
            return res.status(400).json({ message: 'assignments must be a non-empty array of { candidateId, letter }' });
        }

        const results = [];
        for (const { candidateId, letter } of assignments) {
            if (!candidateId || !letter) continue;
            const doc = await CodeLetter.findOneAndUpdate(
                { programme: programmeId, candidate: candidateId },
                { letter: letter.toUpperCase().trim(), assignedBy: req.user._id },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            results.push(doc);
        }

        res.status(200).json({ message: `${results.length} code letter(s) saved.`, codeLetters: results });
    } catch (error) {
        console.error('Error in bulkAssignCodeLetters:', error);
        // Duplicate key = letter collision within same programme
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Duplicate letter detected within this programme. Each letter must be unique.' });
        }
        res.status(500).json({ message: 'Failed to assign code letters', error: error.message });
    }
};

// @desc Get all code letters for a programme
// @route GET /api/programmes/:id/code-letters
// @access Private (admin | volunteer)
const getCodeLetters = async (req, res) => {
    try {
        const codeLetters = await CodeLetter.find({ programme: req.params.id })
            .populate('candidate', 'name admissionNo')
            .populate('assignedBy', 'userName')
            .sort({ letter: 1 });
        res.status(200).json(codeLetters);
    } catch (error) {
        console.error('Error in getCodeLetters:', error);
        res.status(500).json({ message: 'Failed to fetch code letters', error: error.message });
    }
};

module.exports = { bulkAssignCodeLetters, getCodeLetters };
