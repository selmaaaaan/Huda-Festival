const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');

// Replace the progQuery block
const oldProgQuery = `        // 2. Fetch Programmes for exactly this category
        const progQuery = { category: category };
        if (stageType && stageType !== 'All Stages') {
            progQuery.stageType = stageType.toLowerCase();
        }`;

const newProgQuery = `        // 2. Fetch Programmes for exactly this category
        const progQuery = { category: category };
        if (stageType && stageType !== 'All Stages') {
            progQuery.stageType = stageType.toLowerCase();
        }
        
        // Exclude Kulliyyah Non-Stage from candidate registration grid
        if (category === 'KULLIYYAH') {
            progQuery.stageType = 'stage'; // Only show Stage programs for Kulliyyah in this grid
        }`;

c = c.replace(oldProgQuery, newProgQuery);
fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c, 'utf8');
console.log('Fixed Kulliyyah progQuery');