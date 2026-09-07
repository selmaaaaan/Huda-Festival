const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const Programme = require('../models/Programme');
const { CATEGORIES } = require('../config/bylawRules');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const STARRED_ITEMS = {
  "BIDĀYAH": ["VOCABULARY", "MATH TALENT", "GK QUIZ", "WORD FIGHT ENG", 
    "DICTIONARY MAKING ARB"],
  "ʾŪLĀ": ["SWAFR IQ", "SCIENCE MASTER", "GK QUIZ", "GEO GIANT", "MATH TALENT", 
    "MULĀFAẒA ARB", "WORD FIGHT ENG", "HINDI VIDUAN", "VOCABULARY"],
  "THĀNIYAH": ["EXCEL MASTER", "HISTORY TALK ENG", "GRAMMAR QUIZ", "GEO GIANT", 
    "SWARF IQ", "G.K QUIZ", "MATH TALENT", "SCIENCE MASTER"],
  "THĀNAWIYYAH": ["ALFIYYAH CONTEST", "MULTILINGUAL QUIZ", "MATH TALENT", 
    "SCIENCE MASTER", "WEB DESIGNING", "GK TALENT", "HADEES MUSĀBAQA", 
    "CRYPTIC CROSSWORD"],
  "ʿĀLIYAH": ["MR. TRANSLATOR", "AL ʿARABI", "ALLAME URDU", "MR. ENGLISH", "CODE CRAFT", 
    "LOGICAL REASONING", "QURʾĀN TALENT", "AL FAQĪH", "PROUD MUSLIM", "JOB INTERVIEW", 
    "BAYAN ART", "MANUSCRIPT-READING", "MR. ESPAÑOL"],
};

const REGISTRATION_REQUIRED = {
  "BIDĀYAH": ["GROUP SONG", "KADHAKADHANAM", "SONG ARB", "SONG MLM", "SONG URD", 
    "SPEECH & SONG MLM"],
  "ʾŪLĀ": ["GROUP SONG", "SONG MLM", "SONG ENG", "SONG URD", "SONG ARB", 
    "SPEECH & SONG MALAYALAM", "PADHYAPARAYANAM", "STORY NARRATION ENGLISH"],
  "THĀNIYAH": ["HISTORY TALK ENGLISH", "BHAKTHI GANAM", "SONG ARB", "SONG ENG", 
    "SONG URD", "SPEECH & SONG MALAYALAM", "PADHYAPARAYANAM", "GROUP SONG", "PADAPATTU"],
  "THĀNAWIYYAH": ["PADAPPATTU", "NASHĪD ARB", "SONG URD", "INSPIRING TALK ENG", 
    "TADRIS MLM"],
  "ʿĀLIYAH": ["KHUṬBAH", "MAPPILAPPATTU", "NASHĪD ARB", "GAZAL", "LECTURING ENG", 
    "PADAPPATTU", "ACADEMIC TALK ENG", "RJ TALKS", "POLITICAL SATIRE MLM"],
};

const CURB_GROUPS = [
  { category: "BIDĀYAH", label: "BIDĀYAH (MLM)", limit: 2, items: ["CAPTION MAKING", 
    "DIARY WRITING MLM", "POEM WRITING MLM", "PICTURE STORY MLM"] },
  { category: "BIDĀYAH", label: "BIDĀYAH (READING)", limit: 1, items: ["READING ARABIC", 
    "READING ENGLISH", "READING URDU"] },
  { category: "ʾŪLĀ", label: "ʾŪLĀ (SONG)", limit: 2, items: ["SONG MALAYALAM", 
    "SONG ARABIC", "SONG ENGLISH", "SONG URDU"] },
  { category: "ʾŪLĀ", label: "ʾŪLĀ (SPEECH)", limit: 2, items: ["SPEECH ARABIC", 
    "SPEECH MALAYALAM", "SPEECH URDU", "SPEECH ENGLISH"] },
  { category: "ʾŪLĀ", label: "ʾŪLĀ (MLM)", limit: 2, items: ["ESSAY MALAYALAM", 
    "POEM MALAYALAM", "SHORT STORY MALAYALAM", "NEWS WRITING MALAYALAM", 
    "APPRECIATION MALAYALAM", "IMAGE ELABORATION MLM"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (MLM)", limit: 1, items: ["ESSAY MALAYALAM", 
    "POEM MALAYALAM", "SHORT STORY MALAYALAM"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (ENG)", limit: 2, items: ["ESSAY ENGLISH", 
    "POEM ENGLISH", "SHORT STORY ENGLISH", "TEXT TORNADO"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (ARB)", limit: 2, items: ["ESSAY ARABIC", 
    "POEM ARABIC", "SHORT STORY ARABIC"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (URD)", limit: 2, items: ["ESSAY URDU", 
    "POEM URDU", "SHORT STORY URDU"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (POEM)", limit: 2, items: ["POEM ENG", 
    "POEM MLM", "POEM ARB", "POEM URD"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (ESSAY)", limit: 2, items: ["ESSAY MLM", 
    "ESSAY ARB", "ESSAY URD", "ESSAY ENG"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (STORY)", limit: 2, items: [
    "SHORT STORY ARABIC", "SHORT STORY ENGLISH", "SHORT STORY MALAYALAM", 
    "SHORT STORY URDU"] },
  { category: "THĀNIYAH", label: "THĀNIYAH (SPEECH)", limit: 2, items: ["SPEECH MLM", 
    "SPEECH ARABIC", "SPEECH URDU", "SPEECH ENGLISH"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (MLM)", limit: 2, items: [
    "ESSAY MALAYALAM", "PROSE TO POETRY MALAYALAM", "SHORT STORY MALAYALAM", 
    "MR CRITIC MALAYALAM"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (ENG)", limit: 2, items: [
    "ESSAY ENGLISH", "PROSE TO POETRY ENGLISH", "FEATURE ENGLISH", "TWEETING"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (ARB)", limit: 2, items: [
    "NEWS WRITING ARABIC", "SHORT STORY ARABIC", "POEM ARABIC", "ESSAY ARB"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (URD)", limit: 2, items: [
    "ESSAY URDU", "NEWS WRITING URDU", "SHORT STORY URDU", "POEM URDU"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (POEM)", limit: 2, items: [
    "POEM URDU", "PROSE TO POETRY ENGLISH", "PROSE TO POETRY MALAYALAM", "POEM ARB"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (STORY)", limit: 2, items: [
    "SHORT STORY ARABIC", "SHORT STORY MALAYALAM", "SHORT STORY URDU"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (SPEECH)", limit: 2, items: [
    "GENERAL SPEECH", "INSPIRING TALK", "SPEECH ARABIC", "SPEECH URDU"] },
  { category: "THĀNAWIYYAH", label: "THĀNAWIYYAH (SONG)", limit: 2, items: [
    "PADAPPATTU", "NASHĪD ARB", "SONG URD"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (MLM)", limit: 3, items: ["COPYWRITING MLM", 
    "FEATURE WRITING MLM", "HAIKU MLM", "SCREENPLAY WRITING MLM", "ESSAY MLM", 
    "SHORT STORY MLM"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (URD)", limit: 2, items: ["POEM URD", 
    "ESSAY URD", "SHORT STORY URD", "TARJUMAN-E-SADA"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (ENG)", limit: 2, items: ["ABSTRACT WRITING ENG", 
    "ACADEMIC ESSAY ENG", "POEM ENG", "SHORT STORY ENG"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (POEM)", limit: 2, items: ["POEM ARB", 
    "POEM ENG", "POEM URD"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (STORY)", limit: 2, items: ["SHORT STORY ARABIC", 
    "SHORT STORY ENGLISH", "SHORT STORY URDU", "SHORT STORY MLM"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (ESSAY)", limit: 2, items: ["ESSAY MLM", 
    "ESSAY ENG", "ESSAY URD", "ESSAY ARB"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (SONG)", limit: 2, items: ["MAPPILAPPATTU", 
    "NASHĪD ARB", "SONG ENG", "RAP SONG"] },
  { category: "ʿĀLIYAH", label: "ʿĀLIYAH (SPEECH)", limit: 2, items: [
    "ACADEMIC TALK ENG", "EXTEMPORE SPEECH ARB", "JUNCTION SPEECH MLM", 
    "SIYASI THAQREER URD"] },
  { category: "KULLIYYAH", label: "KULLIYYAH (DEBATE)", limit: 1, items: [
    "DEBATE ENGLISH", "MUNĀẒARAH"] },
];

function normalize(str) {
    if (!str) return "";
    let s = str.toUpperCase().trim().replace(/\s+/g, ' ');
    // Handle language equivalence
    s = s.replace(/\bENG\b/g, 'ENGLISH');
    s = s.replace(/\bARB\b/g, 'ARABIC');
    s = s.replace(/\bMLM\b/g, 'MALAYALAM');
    s = s.replace(/\bURD\b/g, 'URDU');
    s = s.replace(/\bMULT\b/g, 'MULTILINGUAL');
    return s;
}

// Track unmatched flags
const matchedStarred = new Set();
const matchedRegistration = new Set();
const matchedCurb = new Set();

async function processFile(filePath, stageType) {
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping missing file: ${filePath}`);
        return 0;
    }

    let processedCount = 0;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    
    // We expect row 1: title, row 2: categories, row 3: headers, row 4+: data
    // Categories row (row index 1):
    // e.g. BIDĀYAH,,,ʾŪLĀ,,,THĀNIYAH,,,THĀNAWIYYAH,,,ʿĀLIYAH,,,KULLIYYAH,,
    if (lines.length < 4) return 0;
    
    const categoryHeaders = lines[1].split(',');
    
    // Find column offsets for categories. Each category has 3 cols.
    const colToCat = {};
    for (let i = 0; i < categoryHeaders.length; i++) {
        const h = categoryHeaders[i].trim();
        if (h && CATEGORIES.includes(h)) {
            // For columns i, i+1, i+2, the category is h
            colToCat[i] = h;
            colToCat[i+1] = h;
            colToCat[i+2] = h;
        }
    }

    for (let i = 3; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Proper CSV parsing to handle commas in names if needed, but the provided CSV is simple enough.
        // The prompt says we can split by comma if there are no quotes, but standard CSV might have quotes.
        // Assuming simple split for now as seen in provided data.
        const cols = line.split(',');
        
        // Step by 3 columns
        for (let c = 0; c < cols.length; c += 3) {
            const category = colToCat[c];
            if (!category) continue; // No category mapped to this column
            
            const code = cols[c]?.trim();
            const rawName = cols[c+1]?.trim();
            const participantsRaw = cols[c+2]?.trim();
            
            if (!code || !rawName || !participantsRaw) continue;
            
            const normalizedName = normalize(rawName);
            
            let isStarred = false;
            let requiresRegistration = false;
            let curbGroup = null;
            let curbLimit = null;

            // Check Starred
            if (STARRED_ITEMS[category]) {
                const normalizedStarred = STARRED_ITEMS[category].map(normalize);
                if (normalizedStarred.includes(normalizedName)) {
                    isStarred = true;
                    matchedStarred.add(`${category}:${normalizedName}`);
                }
            }

            // Check Registration
            if (REGISTRATION_REQUIRED[category]) {
                const normalizedReg = REGISTRATION_REQUIRED[category].map(normalize);
                if (normalizedReg.includes(normalizedName)) {
                    requiresRegistration = true;
                    matchedRegistration.add(`${category}:${normalizedName}`);
                }
            }

            // Check Curb Groups
            let matchCount = 0;
            CURB_GROUPS.forEach(group => {
                if (group.category === category) {
                    const normalizedGroupItems = group.items.map(normalize);
                    if (normalizedGroupItems.includes(normalizedName)) {
                        curbGroup = group.label;
                        curbLimit = group.limit;
                        matchCount++;
                        matchedCurb.add(`${category}:${normalizedName}`);
                    }
                }
            });

            if (matchCount > 1) {
                console.warn(`Warning: Programme ${rawName} in ${category} matched multiple curb groups! Leaving unset.`);
                curbGroup = null;
                curbLimit = null;
            }
            
            // Upsert Programme
            try {
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
                            type: stageType === 'stage' ? 'Stage' : 'Non-Stage', // map to existing required field
                            date: new Date() // required field fallback
                        }
                    },
                    { upsert: true }
                );
                processedCount++;
            } catch (err) {
                console.error(`Failed to upsert ${code} - ${rawName}:`, err);
            }
        }
    }
    return processedCount;
}

async function run() {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log("Usage: node scripts/importProgrammes.js <stage.csv> <nonstage.csv>");
        process.exit(1);
    }

    const [stageCsv, nonStageCsv] = args;
    let totalProcessed = 0;
    totalProcessed += await processFile(stageCsv, 'stage');
    totalProcessed += await processFile(nonStageCsv, 'non-stage');

    console.log(`\nTotal programmes created/updated: ${totalProcessed}`);

    // Check misses
    const missingStarred = [];
    Object.keys(STARRED_ITEMS).forEach(cat => {
        STARRED_ITEMS[cat].forEach(item => {
            if (!matchedStarred.has(`${cat}:${normalize(item)}`)) {
                missingStarred.push(`${cat} -> ${item}`);
            }
        });
    });

    const missingRegistration = [];
    Object.keys(REGISTRATION_REQUIRED).forEach(cat => {
        REGISTRATION_REQUIRED[cat].forEach(item => {
            if (!matchedRegistration.has(`${cat}:${normalize(item)}`)) {
                missingRegistration.push(`${cat} -> ${item}`);
            }
        });
    });

    const missingCurb = [];
    CURB_GROUPS.forEach(group => {
        group.items.forEach(item => {
            if (!matchedCurb.has(`${group.category}:${normalize(item)}`)) {
                missingCurb.push(`[${group.label}] ${group.category} -> ${item}`);
            }
        });
    });

    console.log(`\n--- UNMATCHED STARRED ITEMS ---`);
    if (missingStarred.length) missingStarred.forEach(m => console.log(m));
    else console.log("All starred items matched successfully.");

    console.log(`\n--- UNMATCHED REGISTRATION REQUIRED ITEMS ---`);
    if (missingRegistration.length) missingRegistration.forEach(m => console.log(m));
    else console.log("All registration items matched successfully.");

    console.log(`\n--- UNMATCHED CURB GROUP ITEMS ---`);
    if (missingCurb.length) missingCurb.forEach(m => console.log(m));
    else console.log("All curb items matched successfully.");

    mongoose.disconnect();
}

run();
