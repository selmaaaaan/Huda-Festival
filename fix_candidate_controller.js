const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/candidateController.js', 'utf8');

const search = `        if(req.file) {
            await cloudinary.uploader.destroy(candidate.image.public_id);
            candidate.image.url =  req.file.path
            candidate.image.public_id = req.file.filename;
        }`;

const replace = `        if(req.file) {
            if (candidate.image && candidate.image.public_id) {
                try { await cloudinary.uploader.destroy(candidate.image.public_id); } catch(e) { console.error("Cloudinary error:", e); }
            }
            if (!candidate.image) candidate.image = {};
            candidate.image.url =  req.file.path;
            candidate.image.public_id = req.file.filename;
        }`;

c = c.replace(search, replace);

fs.writeFileSync('backend-hudafestival-main/controllers/candidateController.js', c, 'utf8');
console.log("Fixed candidateController");