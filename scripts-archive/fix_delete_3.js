const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/candidateController.js', 'utf8');

const startIdx = c.indexOf('const deleteCandidate =');
const endIdx = c.indexOf('const addMinusPoints =', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newDelete = `const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if(!candidate) {
            return res.status(404).json({ message: 'Candidate not found'});
        }

        if (req.user.role === 'team_leader' && candidate.team.toString() !== req.user.team.toString()) {
            return res.status(403).json({ message: "You can only delete your own team's candidates" });
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

        const Registration = require('../models/Registration');
        const regs = await Registration.find({ candidates: candidate._id });
        for (let reg of regs) {
            reg.candidates = reg.candidates.filter(cId => cId.toString() !== candidate._id.toString());
            if (reg.candidates.length === 0) {
                await reg.deleteOne();
            } else {
                await reg.save();
            }
        }

        const PointAdjustment = require('../models/PointAdjustment');
        await PointAdjustment.deleteMany({ appliesTo: 'candidate', candidate: candidate._id });

        if (candidate.image && candidate.image.public_id) {
            try {
                await cloudinary.uploader.destroy(candidate.image.public_id);
            } catch (err) {
                console.error('Cloudinary delete error:', err);
            }
        }

        await candidate.deleteOne();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'CANDIDATE_DELETED', entityType: 'Candidate', entityId: candidate._id, details: { name: candidate.name }, req });
        
        return res.status(200).json({ message: 'Candidate deleted successfully' });
    }
    catch(error) {
        console.error('Error deleting candidate: ', error);
        res.status(500).json({ message: 'Failed to deleteCandidate', error: error.message || 'Unknown error' });
    }
}

`;
    c = c.substring(0, startIdx) + newDelete + c.substring(endIdx);
    fs.writeFileSync('backend-hudafestival-main/controllers/candidateController.js', c, 'utf8');
    console.log('Fixed exactly using index');
} else {
    console.log('Could not find indices');
}