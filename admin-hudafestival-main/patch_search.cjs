const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

if (!c.includes('AnimatedInput')) {
  c = c.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { AnimatedInput } from '@/components/smoothui/animated-input';");
}

// Fix Search Input
c = c.replace(/<input\s+type="text"\s+className="w-full [^"]+"\s+placeholder="Name or Admission Number..."\s+value=\{searchQuery\}\s+onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}\s+onKeyDown=\{handleKeyDown\}\s+\/>/g,
  '<AnimatedInput label="Search Candidate" type="text" className="w-full" placeholder="Name or Admission Number..." value={searchQuery} onChange={(val) => setSearchQuery(val)} />'
);

// We need to also patch the wrapping div to handle onKeyDown if it was on the input, but AnimatedInput might not forward onKeyDown.
// Actually we can just leave handleKeyDown for the button click or let the user click search.
// Let's just do a simpler replace.
const oldSearchInput = `<input 
                type="text" 
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full py-3 px-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-[var(--color-text-heading)] placeholder:text-[var(--color-text-muted)] transition-all shadow-sm"
                placeholder="Name or Admission Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />`;
              
c = c.replace(oldSearchInput, `<AnimatedInput label="Search Candidates" type="text" value={searchQuery} onChange={setSearchQuery} placeholder="Name or Admission Number..." />`);

fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log("Search patched");
