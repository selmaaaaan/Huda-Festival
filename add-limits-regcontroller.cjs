const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

const oldCheck = `const { CATEGORY_ITEM_LIMITS } = require('../config/bylawRules');
        if (programme.format === 'Individual' && programme.type !== 'Kulliyyah') {
            for (const candidate of candidates) {
                const limits = CATEGORY_ITEM_LIMITS[candidate.category];
                if (limits) {`;

const newCheck = `if (programme.format === 'Individual' && programme.type !== 'Kulliyyah') {
            for (const candidate of candidates) {
                const limits = settings?.categoryItemLimits ? settings.categoryItemLimits.get(candidate.category) : undefined;
                if (limits) {`;

code = code.replace(oldCheck, newCheck);

// Let's also handle the case where it might be `const { CATEGORY_ITEM_LIMITS }` somewhere else.
// Actually, `oldCheck` is exactly what I saw earlier in the file.

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', code);
console.log('Patched registrationController.js for categoryItemLimits');
