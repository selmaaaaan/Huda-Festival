const mongoose = require('mongoose');
const Programme = require('../models/Programme');
require('dotenv').config();

const requiredRegistration = {
    "BIDĀYAH": ['GROUP SONG', 'KADHAKADHANAM', 'SONG ARB', 'SONG MLM', 'SONG URD', 'SPEECH & SONG MLM', 'SONG ARABIC', 'SONG MALAYALAM', 'SPEECH & SONG MALAYALAM', 'SONG URDU'],
    "ʾŪLĀ": ['GROUP SONG', 'SONG MLM', 'SONG ENG', 'SONG URD', 'SONG ARB', 'SPEECH & SONG MALAYALAM', 'PADHYAPARAYANAM', 'STORY NARRATION ENGLISH', 'SONG MALAYALAM', 'SONG ENGLISH', 'SONG URDU', 'SONG ARABIC'],
    "THĀNIYAH": ['HISTORY TALK ENGLISH', 'BHAKTHI GANAM', 'SONG ARB', 'SONG ENG', 'SONG URD', 'SPEECH & SONG MALAYALAM', 'PADHYAPARAYANAM', 'GROUP SONG', 'PADAPATTU', 'SONG ARABIC', 'SONG ENGLISH', 'SONG URDU', 'HISTORY TALK ENG'],
    "THĀNAWIYYAH": ['PADAPPATTU', 'NASHĪD ARB', 'SONG URD', 'INSPIRING TALK ENG', 'TADRIS MLM', 'SONG URDU', 'INSPIRING TALK ENGLISH', 'TADRIS MALAYALAM'],
    "ʿĀLIYAH": ['KHUṬBAH', 'MAPPILAPPATTU', 'NASHĪD ARB', 'GAZAL', 'LECTURING ENG', 'PADAPPATTU', 'ACADEMIC TALK ENG', 'RJ TALKS', 'POLITICAL SATIRE MLM', 'LECTURING ENGLISH', 'ACADEMIC TALK ENGLISH', 'POLITICAL SATIRE MALAYALAM']
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        let updateCount = 0;
        const programmes = await Programme.find({});
        for (const prog of programmes) {
            let cat = prog.category;
            let name = prog.name.toUpperCase().trim();
            if (cat === 'BIDAYA') cat = 'BIDĀYAH';
            if (cat === 'ULA') cat = 'ʾŪLĀ';
            if (cat === 'THANIYYAH') cat = 'THĀNIYAH';
            if (cat === 'THANAWIYYAH') cat = 'THĀNAWIYYAH';
            if (cat === 'ALIYA') cat = 'ʿĀLIYAH';
            if (cat === 'GENERAL') cat = 'KULLIYYAH';
            
            if (requiredRegistration[cat] && requiredRegistration[cat].some(i => i.toUpperCase() === name)) {
                if (prog.topicMode === 'none') {
                    prog.topicMode = 'free-text'; // Topic Registration required
                    await prog.save();
                    updateCount++;
                }
            }
        }
        console.log('Updated topicMode to free-text for ' + updateCount + ' programmes.');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
