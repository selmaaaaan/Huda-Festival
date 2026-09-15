const fs = require('fs');

function patchFile(filepath) {
  let code = fs.readFileSync(filepath, 'utf8');

  // Change topicCategories logic
  const oldCats = /const topicCategories = useMemo\(\(\) => \{\s*const cats = \[\.\.\.new Set\(eligibleTopicProgrammes\.map\(p => p\.category\)\)\];\s*return cats\.sort\(\);\s*\}, \[eligibleTopicProgrammes\]\);/g;
  
  const newCats = `const topicCategories = useMemo(() => {
    const registeredProgrammeIds = myRegistrations.filter(r => r.status !== 'rejected').map(r => r.programme._id || r.programme);
    const validProgrammes = eligibleTopicProgrammes.filter(p => registeredProgrammeIds.includes(p._id));
    const cats = [...new Set(validProgrammes.map(p => p.category))];
    return cats.sort();
  }, [eligibleTopicProgrammes, myRegistrations]);`;

  let replaced = code.replace(oldCats, newCats);
  
  if (replaced !== code) {
    fs.writeFileSync(filepath, replaced);
    console.log('Patched ' + filepath);
  } else {
    console.log('Regex did not match in ' + filepath);
  }
}

patchFile('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx');
patchFile('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx');
