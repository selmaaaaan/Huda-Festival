const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/models/Settings.js', 'utf8');

if (!code.includes('categoryItemLimits')) {
    code = code.replace(
        /categoryTopicRegistrationStatus: \{\n\s*type: Map,\n\s*of: Boolean,\n\s*default: \{\}\n\s*\},/,
        `categoryTopicRegistrationStatus: {
        type: Map,
        of: Boolean,
        default: {}
    },
    categoryItemLimits: {
        type: Map,
        of: new mongoose.Schema({
            total: { type: Number, default: 9 },
            stage: { type: Number, default: 4 },
            nonStage: { type: Number, default: 5 }
        }, { _id: false }),
        default: {
            'BIDĀYAH': { total: 9, stage: 4, nonStage: 5 },
            'ŪLĀ': { total: 9, stage: 4, nonStage: 5 },
            'THĀNIYAH': { total: 9, stage: 4, nonStage: 5 },
            'THĀNAWIYYAH': { total: 11, stage: 5, nonStage: 6 },
            'ĀLIYAH': { total: 9, stage: 4, nonStage: 5 }
        }
    },`
    );
    fs.writeFileSync('backend-hudafestival-main/models/Settings.js', code);
    console.log('Added categoryItemLimits to Settings.js');
} else {
    console.log('categoryItemLimits already exists in Settings.js');
}
