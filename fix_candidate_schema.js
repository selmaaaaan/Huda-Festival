const fs = require('fs');

let c = fs.readFileSync('backend-hudafestival-main/models/Candidate.js', 'utf8');
c = c.replace(/image: \{\r?\n\s+url: \{\r?\n\s+type: String,\r?\n\s+required: true,\r?\n\s+\},\r?\n\s+public_id: \{\r?\n\s+type: String,\r?\n\s+required: true,\r?\n\s+\}\r?\n\s+\},/, 
`image: {
        url: {
            type: String,
            required: false,
        },
        public_id: {
            type: String,
            required: false,
        }
    },`);

fs.writeFileSync('backend-hudafestival-main/models/Candidate.js', c, 'utf8');
console.log("Fixed schema");