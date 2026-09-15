const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/components/AddCandidate.jsx', 'utf8');

c = c.replace(/<input type="text" name="admissionNo" required onChange=\{handleChange\}/, `<input type="text" name="admissionNo" value={formData.admissionNo} required onChange={handleChange}`);

c = c.replace(/<input type="text" name="name" required onChange=\{handleChange\}/, `<input type="text" name="name" value={formData.name} required onChange={handleChange}`);

c = c.replace(/<input type="file" name="image" required onChange=\{handleFileChange\}/, `<input type="file" name="image" required={!initialData} onChange={handleFileChange}`);

fs.writeFileSync('admin-hudafestival-main/src/components/AddCandidate.jsx', c, 'utf8');
console.log("Inputs fixed!");