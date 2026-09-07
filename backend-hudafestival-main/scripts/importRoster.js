const mongoose = require('mongoose');
const fs = require('fs');
const Team = require('../models/Team');
const Candidate = require('../models/Candidate');
const { CATEGORIES } = require('../config/bylawRules');
require('dotenv').config();

async function run(filePath) {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');
        await importRoster(filePath);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

async function importRoster(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');

    let teamsCreated = 0;
    let candidatesCreated = 0;
    let candidatesUpdated = 0;
    const mismatchWarnings = [];
    
    // Team Cache map: TeamName -> ObjectId
    const teamMap = new Map();

    // Pre-populate cache with existing teams
    const existingTeams = await Team.find({});
    existingTeams.forEach(t => teamMap.set(t.name, t._id));

    // skip header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const parts = line.split(',');
        if (parts.length < 6) continue;

        const admissionNo = parts[1].trim();
        const name = parts[2].trim();
        const teamName = parts[3].trim();
        const classLevel = parts[4].trim();
        const rawCategory = parts[5].trim();

        // Validate Category
        let category = rawCategory;
        if (!CATEGORIES.includes(category)) {
            mismatchWarnings.push(`Row ${i+1}: Unknown category "${rawCategory}" for candidate ${name}`);
        }

        // Upsert Team
        let teamId = teamMap.get(teamName);
        if (!teamId) {
            try {
                const newTeam = await Team.create({ name: teamName });
                teamId = newTeam._id;
                teamMap.set(teamName, teamId);
                teamsCreated++;
            } catch (err) {
                if (err.code === 11000) {
                    const t = await Team.findOne({ name: teamName });
                    teamId = t._id;
                    teamMap.set(teamName, teamId);
                } else {
                    console.error(`Error creating team ${teamName}:`, err);
                    continue;
                }
            }
        }

        // Upsert Candidate
        try {
            const existingCandidate = await Candidate.findOne({ admissionNo });
            
            const candidateData = {
                name,
                team: teamId,
                classLevel,
                category
            };

            if (existingCandidate) {
                await Candidate.updateOne({ admissionNo }, { $set: candidateData });
                candidatesUpdated++;
            } else {
                candidateData.admissionNo = admissionNo;
                candidateData.image = {
                    url: 'https://via.placeholder.com/150',
                    public_id: 'placeholder'
                };
                await Candidate.create(candidateData);
                candidatesCreated++;
            }
        } catch (err) {
            console.error(`Error upserting candidate ${admissionNo} - ${name}:`, err);
        }
    }

    console.log('\n--- Import Summary ---');
    console.log(`Teams Created: ${teamsCreated}`);
    console.log(`Candidates Created: ${candidatesCreated}`);
    console.log(`Candidates Updated: ${candidatesUpdated}`);
    
    if (mismatchWarnings.length > 0) {
        console.log('\n--- Category Mismatch Warnings ---');
        mismatchWarnings.forEach(w => console.log(w));
    }
    
    mongoose.disconnect();
}

const args = process.argv.slice(2);
if (args.length !== 1) {
    console.log("Usage: node scripts/importRoster.js <roster.csv>");
    process.exit(1);
}

run(args[0]);
