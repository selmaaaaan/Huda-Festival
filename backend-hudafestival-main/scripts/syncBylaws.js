const mongoose = require('mongoose');
require('dotenv').config();
const Programme = require('../models/Programme');

const curbList = {
    "BIDĀYAH": [
        { limit: 2, group: 'BIDĀYAH (MLM)', items: ['CAPTION MAKING', 'DIARY WRITING MLM', 'POEM WRITING MLM', 'PICTURE STORY MLM'] },
        { limit: 1, group: 'BIDĀYAH (READING)', items: ['READING ARABIC', 'READING ENGLISH', 'READING URDU'] }
    ],
    "ʾŪLĀ": [
        { limit: 2, group: 'ŪLĀ (SONG)', items: ['SONG MALAYALAM', 'SONG ARABIC', 'SONG ENGLISH', 'SONG URDU'] },
        { limit: 2, group: 'ŪLĀ (SPEECH)', items: ['SPEECH ARABIC', 'SPEECH MALAYALAM', 'SPEECH URDU', 'SPEECH ENGLISH'] },
        { limit: 2, group: 'ŪLĀ (MLM)', items: ['ESSAY MALAYALAM', 'POEM MALAYALAM', 'SHORT STORY MALAYALAM', 'NEWS WRITING MALAYALAM', 'APPRECIATION MALAYALAM', 'IMAGE ELABORATION MLM'] }
    ],
    "THĀNIYAH": [
        { limit: 1, group: 'THĀNIYAH (MLM)', items: ['ESSAY MALAYALAM', 'POEM MALAYALAM', 'SHORT STORY MALAYALAM'] },
        { limit: 2, group: 'THĀNIYAH (ENG)', items: ['ESSAY ENGLISH', 'POEM ENGLISH', 'SHORT STORY ENGLISH', 'TEXT TORNADO'] },
        { limit: 2, group: 'THĀNIYAH (ARB)', items: ['ESSAY ARABIC', 'POEM ARABIC', 'SHORT STORY ARABIC'] },
        { limit: 2, group: 'THĀNIYAH (URD)', items: ['ESSAY URDU', 'POEM URDU', 'SHORT STORY URDU'] },
        { limit: 2, group: 'THĀNIYAH (POEM)', items: ['POEM ENG', 'POEM MLM', 'POEM ARB', 'POEM URD', 'POEM ENGLISH', 'POEM MALAYALAM', 'POEM ARABIC', 'POEM URDU'] },
        { limit: 2, group: 'THĀNIYAH (ESSAY)', items: ['ESSAY MLM', 'ESSAY ARB', 'ESSAY URD', 'ESSAY ENG', 'ESSAY MALAYALAM', 'ESSAY ARABIC', 'ESSAY URDU', 'ESSAY ENGLISH'] },
        { limit: 2, group: 'THĀNIYAH (STORY)', items: ['SHORT STORY ARABIC', 'SHORT STORY ENGLISH', 'SHORT STORY MALAYALAM', 'SHORT STORY URDU'] },
        { limit: 2, group: 'THĀNIYAH (SPEECH)', items: ['SPEECH MLM', 'SPEECH ARABIC', 'SPEECH URDU', 'SPEECH ENGLISH', 'SPEECH MALAYALAM'] }
    ],
    "THĀNAWIYYAH": [
        { limit: 2, group: 'THĀNAWIYYAH (MLM)', items: ['ESSAY MALAYALAM', 'PROSE TO POETRY MALAYALAM', 'SHORT STORY MALAYALAM', 'MR CRITIC MALAYALAM'] },
        { limit: 2, group: 'THĀNAWIYYAH (ENG)', items: ['ESSAY ENGLISH', 'PROSE TO POETRY ENGLISH', 'FEATURE ENGLISH', 'TWEETING'] },
        { limit: 2, group: 'THĀNAWIYYAH (ARB)', items: ['NEWS WRITING ARABIC', 'SHORT STORY ARABIC', 'POEM ARABIC', 'ESSAY ARB', 'ESSAY ARABIC'] },
        { limit: 2, group: 'THĀNAWIYYAH (URD)', items: ['ESSAY URDU', 'NEWS WRITING URDU', 'SHORT STORY URDU', 'POEM URDU'] },
        { limit: 2, group: 'THĀNAWIYYAH (POEM)', items: ['POEM URDU', 'PROSE TO POETRY ENGLISH', 'PROSE TO POETRY MALAYALAM', 'POEM ARB', 'POEM ARABIC'] },
        { limit: 2, group: 'THĀNAWIYYAH (STORY)', items: ['SHORT STORY ARABIC', 'SHORT STORY MALAYALAM', 'SHORT STORY URDU'] },
        { limit: 2, group: 'THĀNAWIYYAH (SPEECH)', items: ['GENERAL SPEECH', 'INSPIRING TALK', 'SPEECH ARABIC', 'SPEECH URDU'] },
        { limit: 2, group: 'THĀNAWIYYAH (SONG)', items: ['PADAPPATTU', 'NASHĪD ARB', 'SONG URD', 'SONG URDU'] }
    ],
    "ʿĀLIYAH": [
        { limit: 3, group: 'ʿĀLIYAH (MLM)', items: ['COPYWRITING MLM', 'FEATURE WRITING MLM', 'HAIKU MLM', 'SCREENPLAY WRITING MLM', 'ESSAY MLM', 'SHORT STORY MLM', 'ESSAY MALAYALAM', 'SHORT STORY MALAYALAM'] },
        { limit: 2, group: 'ʿĀLIYAH (URD)', items: ['POEM URD', 'ESSAY URD', 'SHORT STORY URD', 'TARJUMAN-E-SADA', 'POEM URDU', 'ESSAY URDU', 'SHORT STORY URDU'] },
        { limit: 2, group: 'ʿĀLIYAH (ENG)', items: ['ABSTRACT WRITING ENG', 'ACADEMIC ESSAY ENG', 'POEM ENG', 'SHORT STORY ENG', 'POEM ENGLISH', 'SHORT STORY ENGLISH'] },
        { limit: 2, group: 'ʿĀLIYAH (POEM)', items: ['POEM ARB', 'POEM ENG', 'POEM URD', 'POEM ARABIC', 'POEM ENGLISH', 'POEM URDU'] },
        { limit: 2, group: 'ʿĀLIYAH (STORY)', items: ['SHORT STORY ARABIC', 'SHORT STORY ENGLISH', 'SHORT STORY URDU', 'SHORT STORY MLM', 'SHORT STORY MALAYALAM'] },
        { limit: 2, group: 'ʿĀLIYAH (ESSAY)', items: ['ESSAY MLM', 'ESSAY ENG', 'ESSAY URD', 'ESSAY ARB', 'ESSAY MALAYALAM', 'ESSAY ENGLISH', 'ESSAY URDU', 'ESSAY ARABIC'] },
        { limit: 2, group: 'ʿĀLIYAH (SONG)', items: ['MAPPILAPPATTU', 'NASHĪD ARB', 'SONG ENG', 'SONG ENGLISH'] },
        { limit: 2, group: 'ʿĀLIYAH (SPEECH)', items: ['ACADEMIC TALK ENG', 'EXTEMPORE SPEECH ARB', 'JUNCTION SPEECH MLM', 'SIYASI THAQREER URD', 'ACADEMIC TALK ENGLISH', 'JUNCTION SPEECH MALAYALAM'] }
    ],
    "KULLIYYAH": [
        { limit: 1, group: 'KULLIYYAH (DEBATE)', items: ['DEBATE ENGLISH', 'MUNĀẒARAH'] }
    ]
};

const requiredRegistration = {
    "BIDĀYAH": ['GROUP SONG', 'KADHAKADHANAM', 'SONG ARB', 'SONG MLM', 'SONG URD', 'SPEECH & SONG MLM', 'SONG ARABIC', 'SONG MALAYALAM', 'SPEECH & SONG MALAYALAM', 'SONG URDU'],
    "ʾŪLĀ": ['GROUP SONG', 'SONG MLM', 'SONG ENG', 'SONG URD', 'SONG ARB', 'SPEECH & SONG MALAYALAM', 'PADHYAPARAYANAM', 'STORY NARRATION ENGLISH', 'SONG MALAYALAM', 'SONG ENGLISH', 'SONG URDU', 'SONG ARABIC'],
    "THĀNIYAH": ['HISTORY TALK ENGLISH', 'BHAKTHI GANAM', 'SONG ARB', 'SONG ENG', 'SONG URD', 'SPEECH & SONG MALAYALAM', 'PADHYAPARAYANAM', 'GROUP SONG', 'PADAPATTU', 'SONG ARABIC', 'SONG ENGLISH', 'SONG URDU', 'HISTORY TALK ENG'],
    "THĀNAWIYYAH": ['PADAPPATTU', 'NASHĪD ARB', 'SONG URD', 'INSPIRING TALK ENG', 'TADRIS MLM', 'SONG URDU', 'INSPIRING TALK ENGLISH', 'TADRIS MALAYALAM'],
    "ʿĀLIYAH": ['KHUṬBAH', 'MAPPILAPPATTU', 'NASHĪD ARB', 'GAZAL', 'LECTURING ENG', 'PADAPPATTU', 'ACADEMIC TALK ENG', 'RJ TALKS', 'POLITICAL SATIRE MLM', 'LECTURING ENGLISH', 'ACADEMIC TALK ENGLISH', 'POLITICAL SATIRE MALAYALAM']
};

const starredItems = {
    "BIDĀYAH": ['VOCABULARY', 'MATH TALENT', 'GK QUIZ', 'WORD FIGHT ENG', 'DICTIONARY MAKING ARB', 'WORD FIGHT ENGLISH', 'DICTIONARY MAKING ARABIC', 'G.K QUIZ'],
    "ʾŪLĀ": ['SWAFR IQ', 'SCIENCE MASTER', 'GK QUIZ', 'GEO GIANT', 'MATH TALENT', 'MULĀFAẒA ARB', 'WORD FIGHT ENG', 'HINDI VIDUAN', 'VOCABULARY', 'G.K QUIZ', 'MULĀFAẒA ARABIC', 'WORD FIGHT ENGLISH'],
    "THĀNIYAH": ['EXCEL MASTER', 'HISTORY TALK ENG', 'GRAMMAR QUIZ', 'GEO GIANT', 'SWARF IQ', 'G.K QUIZ', 'MATH TALENT', 'SCIENCE MASTER', 'HISTORY TALK ENGLISH', 'GK QUIZ'],
    "THĀNAWIYYAH": ['ALFIYYAH CONTEST', 'MULTILINGUAL QUIZ', 'MATH TALENT', 'SCIENCE MASTER', 'WEB DESIGNING', 'GK TALENT', 'HADEES MUSĀBAQA', 'CRYPTIC CROSSWORD', 'G.K TALENT'],
    "ʿĀLIYAH": ['Mr. TRANSLATOR', 'AL ʿARABI', 'ALLAME URDU', 'Mr. ENGLISH', 'CODE CRAFT', 'LOGICAL REASONING', 'QURʾĀN TALENT', 'AL FAQĪH', 'PROUD MUSLIM', 'JOB INTERVIEW', 'BAYAN ART', 'MANUSCRIPT-READING', 'MR. ESPAÑOL', 'MR. TRANSLATOR']
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for bylaw sync.');
        
        // Reset everything first
        await Programme.updateMany({}, { 
            $set: { curbGroup: null, curbLimit: null, isStarred: false, requiresRegistration: false }
        });

        const programmes = await Programme.find({});
        let updateCount = 0;

        for (const prog of programmes) {
            let cat = prog.category;
            let name = prog.name.toUpperCase().trim();
            
            // Note: DB uses 'BIDAYA', 'ULA', 'THANIYYAH', 'THANAWIYYAH', 'ALIYA' or the unicode versions
            // Let's normalize cat to Unicode to match our lookup tables
            if (cat === 'BIDAYA') cat = 'BIDĀYAH';
            if (cat === 'ULA') cat = 'ʾŪLĀ';
            if (cat === 'THANIYYAH') cat = 'THĀNIYAH';
            if (cat === 'THANAWIYYAH') cat = 'THĀNAWIYYAH';
            if (cat === 'ALIYA') cat = 'ʿĀLIYAH';
            if (cat === 'GENERAL') cat = 'KULLIYYAH';

            let updated = false;

            // Apply Starred
            if (starredItems[cat]) {
                if (starredItems[cat].some(i => i.toUpperCase() === name)) {
                    prog.isStarred = true;
                    updated = true;
                }
            }

            // Apply Requires Registration
            if (requiredRegistration[cat]) {
                if (requiredRegistration[cat].some(i => i.toUpperCase() === name)) {
                    prog.requiresRegistration = true;
                    updated = true;
                }
            }

            // Apply Curbs
            if (curbList[cat]) {
                for (const curb of curbList[cat]) {
                    if (curb.items.some(i => i.toUpperCase() === name)) {
                        prog.curbGroup = curb.group;
                        prog.curbLimit = curb.limit;
                        updated = true;
                        break;
                    }
                }
            }

            if (updated) {
                await prog.save();
                updateCount++;
            }
        }

        console.log(`Successfully synced bylaw rules for ${updateCount} programmes.`);
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
