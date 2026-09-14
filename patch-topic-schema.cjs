const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/models/TopicRegistration.js', 'utf8');

code = code.replace(
    /topic: \{ type: String, required: true \},/,
    `topic: { type: String, required: true },\n  attachment: { type: String },`
);

fs.writeFileSync('backend-hudafestival-main/models/TopicRegistration.js', code);
console.log('Updated TopicRegistration.js with attachment');
