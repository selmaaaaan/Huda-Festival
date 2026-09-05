const Team = require('../models/Team');
const Candidate = require('../models/Candidate');

// @desc    Get all leaderboards (teams and top students by category)
// @route   GET /api/leaderboards
// @access  Public
const getLeaderboards = async (req, res) => {
    try {
        // --- 1. Get Team Leaderboard (No change here) ---
        const teamLeaderboard = await Team.find({}).sort({ totalPoints: -1 });

        // --- 2. Get Top Student Leaderboards (THIS IS THE UPDATED PART) ---
        const categoryTopStudents = await Candidate.aggregate([
            { $match: { totalPoints: { $gt: 0 } } },
            { $sort: { totalPoints: -1 } },
            // THE FIX: We use $lookup to join with the 'teams' collection
            {
                $lookup: {
                    from: 'teams', // The collection to join with
                    localField: 'team', // The field from the Candidate document
                    foreignField: '_id', // The field from the Team document
                    as: 'teamInfo' // The name of the new array field to add
                }
            },
            // $lookup creates an array, so we use $unwind to flatten it
            {
                $unwind: '$teamInfo'
            },
            {
                $group: {
                    _id: "$category",
                    candidates: { 
                        $push: { 
                            _id: "$_id",
                            name: "$name",
                            totalPoints: "$totalPoints",
                            image: "$image",
                            // Now we push the populated team object
                            team: { _id: "$teamInfo._id", name: "$teamInfo.name" }
                        }
                    }
                }
            },
            {
                $project: {
                    category: "$_id",
                    candidates: { $slice: ["$candidates", 5] },
                    _id: 0
                }
            }
        ]);
        
        // --- 3. Get Overall Top Students (No change here) ---
        const overallTopStudents = await Candidate.find({})
            .sort({ totalPoints: -1 })
            .limit(10)
            .populate('team', 'name');
        
        res.status(200).json({
            teamLeaderboard,
            categoryTopStudents, // Send the newly fixed data
            overallTopStudents,
        });

    } catch (error) {
        console.error("Error fetching leaderboards:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getLeaderboards };
