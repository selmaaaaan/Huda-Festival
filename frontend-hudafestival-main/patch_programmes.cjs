const fs = require('fs');

const file = 'src/pages/ProgrammeListPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Import motion
if (!content.includes("import { motion } from 'framer-motion';")) {
    content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { motion } from 'framer-motion';");
}

// Typography
content = content.replace(
    'className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"',
    'className="text-3xl md:text-5xl font-extrabold font-[poppins] tracking-wider text-gray-900 mb-4"'
);

// Card styling & motion
content = content.replace(
    '<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-gray-200">',
    '<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md">'
);

content = content.replace(
    '</Link>\n            ) : null}\n          </div>\n        </div>',
    '</Link>\n            ) : null}\n          </div>\n        </div>'
);

content = content.replace(
    // the closing div for the card
    '</div>\n    );\n  };\n  \n  export default ProgrammesPage;',
    '</motion.div>\n    );\n  };\n  \n  export default ProgrammesPage;'
);

fs.writeFileSync(file, content);
console.log("ProgrammeListPage patched.");
