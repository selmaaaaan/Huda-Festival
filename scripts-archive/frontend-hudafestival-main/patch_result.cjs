const fs = require('fs');

function patchResult() {
    let file = 'src/pages/ResultPage.jsx';
    let code = fs.readFileSync(file, 'utf8');

    code = code.replace(
        'className="text-3xl font-bold text-center text-[var(--color-text-heading)] mb-1"',
        'className="text-3xl md:text-5xl font-extrabold font-[poppins] tracking-wider text-center text-green-900 mb-1"'
    );

    if (!code.includes("import { motion }")) {
        code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';");
    }

    code = code.replace(
        /<div key=\{result\._id\} className="bg-\[var\(--color-surface-elevated\)\] rounded-xl p-4 sm:p-6/g,
        '<motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} key={result._id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-green-100'
    );

    code = code.replace(
        '</div>\n                </div>\n              </div>\n            ))}',
        '</div>\n                </div>\n              </motion.div>\n            ))}'
    );

    fs.writeFileSync(file, code);
    console.log('ResultPage patched.');
}

patchResult();
