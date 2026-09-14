const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/registrationController.js', 'utf8');

code = code.replace(
    /const \{ CATEGORY_ITEM_LIMITS \} = require\('\.\.\/config\/bylawRules'\);\s*if \(programme\.format === 'Individual' && programme\.type !== 'Kulliyyah'\) \{\s*for \(const candidate of candidates\) \{\s*const limits = CATEGORY_ITEM_LIMITS\[candidate\.category\];/g,
    `if (programme.format === 'Individual' && programme.type !== 'Kulliyyah') {
            for (const candidate of candidates) {
                const limits = settings?.categoryItemLimits ? settings.categoryItemLimits.get(candidate.category) : undefined;`
);

fs.writeFileSync('backend-hudafestival-main/controllers/registrationController.js', code);
console.log('Regex patched registrationController.js');
