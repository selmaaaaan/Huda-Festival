const Team = require('../models/Team');
const Candidate = require('../models/Candidate');
const Programme = require('../models/Programme');
const Settings = require('../models/Settings');
const { CATEGORIES, STARRED_ITEMS, REGISTRATION_REQUIRED, CURB_GROUPS } = require('../config/bylawRules');
const cloudinary = require('../config/cloudinary');

function normalize(str) {
    if (!str) return "";
    let s = str.toUpperCase().trim().replace(/\s+/g, ' ');
    s = s.replace(/\bENG\b/g, 'ENGLISH');
    s = s.replace(/\bARB\b/g, 'ARABIC');
    s = s.replace(/\bMLM\b/g, 'MALAYALAM');
    s = s.replace(/\bURD\b/g, 'URDU');
    s = s.replace(/\bMULT\b/g, 'MULTILINGUAL');
    return s;
}

const importProgrammes = async (req, res) => {
    try {
        if (!req.files || !req.files.stage || !req.files.nonstage) {
            return res.status(400).json({ message: 'Please upload both stage and nonstage CSV files.' });
        }

        const matchedStarred = new Set();
        const matchedRegistration = new Set();
        const matchedCurb = new Set();

        const processFile = async (buffer, stageType) => {
            let processedCount = 0;
            const fileContent = buffer.toString('utf8');
            const lines = fileContent.split('\n');
            if (lines.length < 4) return 0;
            
            const categoryHeaders = lines[1].split(',');
            const colToCat = {};
            for (let i = 0; i < categoryHeaders.length; i++) {
                const h = categoryHeaders[i].trim();
                if (h && CATEGORIES.includes(h)) {
                    colToCat[i] = h;
                    colToCat[i+1] = h;
                    colToCat[i+2] = h;
                }
            }

            for (let i = 3; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const cols = line.split(',');
                for (let c = 0; c < cols.length; c += 3) {
                    const category = colToCat[c];
                    if (!category) continue;
                    
                    const code = cols[c]?.trim();
                    const rawName = cols[c+1]?.trim();
                    const participantsRaw = cols[c+2]?.trim();
                    
                    if (!code || !rawName || !participantsRaw) continue;
                    const normalizedName = normalize(rawName);
                    
                    let isStarred = false;
                    let requiresRegistration = false;
                    let curbGroup = null;
                    let curbLimit = null;

                    if (STARRED_ITEMS[category]) {
                        if (STARRED_ITEMS[category].map(normalize).includes(normalizedName)) {
                            isStarred = true;
                            matchedStarred.add(`${category}:${normalizedName}`);
                        }
                    }

                    if (REGISTRATION_REQUIRED[category]) {
                        if (REGISTRATION_REQUIRED[category].map(normalize).includes(normalizedName)) {
                            requiresRegistration = true;
                            matchedRegistration.add(`${category}:${normalizedName}`);
                        }
                    }

                    let matchCount = 0;
                    CURB_GROUPS.forEach(group => {
                        if (group.category === category) {
                            if (group.items.map(normalize).includes(normalizedName)) {
                                curbGroup = group.label;
                                curbLimit = group.limit;
                                matchCount++;
                                matchedCurb.add(`${category}:${normalizedName}`);
                            }
                        }
                    });

                    if (matchCount > 1) {
                        curbGroup = null;
                        curbLimit = null;
                    }
                    
                    await Programme.updateOne(
                        { code },
                        { 
                            $set: {
                                name: rawName,
                                category,
                                stageType,
                                participantsRaw,
                                isStarred,
                                requiresRegistration,
                                curbGroup,
                                curbLimit,
                                type: stageType === 'stage' ? 'Stage' : 'Non-Stage',
                                date: new Date()
                            }
                        },
                        { upsert: true }
                    );
                    processedCount++;
                }
            }
            return processedCount;
        };

        const stageCount = await processFile(req.files.stage[0].buffer, 'stage');
        const nonstageCount = await processFile(req.files.nonstage[0].buffer, 'non-stage');

        const missingStarred = [];
        Object.keys(STARRED_ITEMS).forEach(cat => {
            STARRED_ITEMS[cat].forEach(item => {
                if (!matchedStarred.has(`${cat}:${normalize(item)}`)) missingStarred.push(`${cat} -> ${item}`);
            });
        });

        const missingRegistration = [];
        Object.keys(REGISTRATION_REQUIRED).forEach(cat => {
            REGISTRATION_REQUIRED[cat].forEach(item => {
                if (!matchedRegistration.has(`${cat}:${normalize(item)}`)) missingRegistration.push(`${cat} -> ${item}`);
            });
        });

        const missingCurb = [];
        CURB_GROUPS.forEach(group => {
            group.items.forEach(item => {
                if (!matchedCurb.has(`${group.category}:${normalize(item)}`)) missingCurb.push(`[${group.label}] ${group.category} -> ${item}`);
            });
        });

        res.json({
            success: true,
            totalProcessed: stageCount + nonstageCount,
            warnings: {
                missingStarred,
                missingRegistration,
                missingCurb
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Import failed' });
    }
};

const importRoster = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a roster CSV file.' });
        }

        const fileContent = req.file.buffer.toString('utf8');
        const lines = fileContent.split('\n');

        let teamsCreated = 0;
        let candidatesCreated = 0;
        let candidatesUpdated = 0;
        const mismatchWarnings = [];
        
        const teamMap = new Map();
        const existingTeams = await Team.find({});
        existingTeams.forEach(t => teamMap.set(t.name, t._id));

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

            let category = rawCategory;
            if (!CATEGORIES.includes(category)) {
                mismatchWarnings.push(`Row ${i+1}: Unknown category "${rawCategory}" for candidate ${name}`);
            }

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
                        continue;
                    }
                }
            }

            try {
                const existingCandidate = await Candidate.findOne({ admissionNo });
                const candidateData = { name, team: teamId, classLevel, category };

                if (existingCandidate) {
                    await Candidate.updateOne({ admissionNo }, { $set: candidateData });
                    candidatesUpdated++;
                } else {
                    candidateData.admissionNo = admissionNo;
                    candidateData.image = { url: 'https://via.placeholder.com/150', public_id: 'placeholder' };
                    await Candidate.create(candidateData);
                    candidatesCreated++;
                }
            } catch (err) {
                // ignore
            }
        }

        res.json({
            success: true,
            summary: {
                teamsCreated,
                candidatesCreated,
                candidatesUpdated
            },
            warnings: mismatchWarnings
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Roster import failed' });
    }
};

const uploadBylaw = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a PDF file.' });
        }

        // Upload to cloudinary
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'bylaws', format: 'pdf' },
            async (error, result) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ message: 'Upload to Cloudinary failed' });
                }

                let settings = await Settings.findOne();
                if (!settings) {
                    settings = new Settings({});
                }
                
                // Assuming we add a bylawUrl field or just stick it in the doc. We'll use schema loosely if it's strict we need to update it.
                // Wait, Mongoose Settings might not have bylawUrl.
                // Let's add it via strict: false or update schema.
                // Actually, I'll update the Settings schema.

                settings.set('bylawUrl', result.secure_url);
                await settings.save();

                res.json({ url: result.secure_url });
            }
        );
        stream.end(req.file.buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Bylaw upload failed' });
    }
};

const getBylawUrl = async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.json({ url: settings ? settings.get('bylawUrl') : null });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    importProgrammes,
    importRoster,
    uploadBylaw,
    getBylawUrl
};
