const Candidate = require('../models/Candidate');
const Programme = require('../models/Programme');
const Team = require('../models/Team');

exports.globalSearch = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (q.length < 2) return res.json({ candidates: [], programmes: [], teams: [] });
    const regex = new RegExp(q, 'i');
    const candidates = await Candidate.find({ $or: [{name: regex}, {admissionNo: regex}] }).limit(5).select('name admissionNo team').populate('team', 'name');
    const programmes = await Programme.find({ $or: [{name: regex}, {code: regex}] }).limit(5).select('name code type');
    const teams = await Team.find({ name: regex }).limit(5).select('name color');
    res.json({ candidates, programmes, teams });
  } catch(err) {
    res.status(500).json({message: err.message});
  }
};
