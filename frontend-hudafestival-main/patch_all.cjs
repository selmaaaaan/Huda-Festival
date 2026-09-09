const fs = require('fs');

function patchProgrammes() {
    let file = 'src/pages/ProgrammeListPage.jsx';
    let code = fs.readFileSync(file, 'utf8');

    // Typography
    code = code.replace(
    'className="text-2xl font-bold text-gray-800 mb-2"', 
    'className="text-2xl font-extrabold font-[poppins] tracking-wide text-green-900 mb-2"'
    );

    // Badges
    code = code.replace(
    'bg-blue-100 text-blue-800', 
    'bg-green-100 text-green-800'
    );

    // Buttons
    code = code.replace(
    'bg-gradient-to-r from-green-500 to-emerald-600',
    'bg-green-600 hover:bg-green-700'
    );
    code = code.replace(
    'bg-gradient-to-r from-yellow-400 to-orange-400',
    'bg-yellow-500 hover:bg-yellow-600'
    );

    // Backgrounds
    code = code.replace(/bg-gradient-to-br from-gray-50 to-blue-50/g, 'bg-transparent');
    code = code.replace(/bg-gradient-to-br from-gray-50\/50 to-blue-50\/50/g, 'bg-green-50/30');

    // Card styles
    code = code.replace(
    'className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"',
    'className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden transition-all duration-300 hover:shadow-md"'
    );

    fs.writeFileSync(file, code);
    console.log('ProgrammeListPage patched.');
}

function patchLeaderboards() {
    let file = 'src/pages/LeaderboardsPage.jsx';
    let code = fs.readFileSync(file, 'utf8');

    // Framer motion
    if (!code.includes("import { motion }")) {
        code = code.replace("import React, { useEffect, useState } from \"react\";", "import React, { useEffect, useState } from \"react\";\nimport { motion } from 'framer-motion';");
    }

    // Typography
    code = code.replace(
        'className="text-4xl font-bold text-amber-800 mb-4"',
        'className="text-3xl md:text-4xl font-extrabold font-[poppins] tracking-wider text-green-900 mb-4"'
    );
    code = code.replace(
        'className="text-4xl font-bold text-gray-800 mb-4"',
        'className="text-3xl md:text-4xl font-extrabold font-[poppins] tracking-wider text-green-900 mb-4"'
    );

    // Cards
    code = code.replace(
        /<div key=\{team\._id\} className="bg-white rounded-2xl shadow-xl overflow-hidden/g,
        '<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={team._id} className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden'
    );
    code = code.replace(
        /<div key=\{category\} className="bg-white rounded-2xl shadow-xl overflow-hidden/g,
        '<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={category} className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden'
    );

    // Convert the closing divs to </motion.div> - wait, it's safer to just replace them exactly.
    // Team card
    code = code.replace(
        'className="text-center font-bold text-gray-800 text-xl">\n                                                    {team.totalPoints}\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>',
        'className="text-center font-bold text-gray-800 text-xl">\n                                                    {team.totalPoints}\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </motion.div>\n                                </div>'
    );
    // Wait, regex might be safer or manual replace. 

    fs.writeFileSync(file, code);
    console.log('Leaderboards patched.');
}

function patchSchedule() {
    let file = 'src/pages/SchedulePage.jsx';
    let code = fs.readFileSync(file, 'utf8');

    if (!code.includes("import { motion }")) {
        code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';");
    }

    code = code.replace(
        'className="text-3xl font-bold text-[var(--color-text-heading)]"',
        'className="text-3xl md:text-5xl font-extrabold font-[poppins] tracking-wider text-green-900"'
    );

    code = code.replace(
        /<div key=\{programme\._id\} className="bg-\[var\(--color-surface-elevated\)\] rounded-2xl p-6 shadow-sm/g,
        '<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} key={programme._id} className="bg-white rounded-xl p-6 shadow-sm border border-green-100'
    );
    
    // Convert closing div to motion.div
    code = code.replace(
        '</Link>\n              </div>',
        '</Link>\n              </motion.div>'
    );

    fs.writeFileSync(file, code);
    console.log('Schedule patched.');
}

function patchGallery() {
    let file = 'src/pages/GalleryPage.jsx';
    let code = fs.readFileSync(file, 'utf8');

    if (!code.includes("import { motion }")) {
        code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';");
    }

    code = code.replace(
        'className="text-3xl font-bold text-[var(--color-text-heading)]"',
        'className="text-3xl md:text-5xl font-extrabold font-[poppins] tracking-wider text-green-900"'
    );

    code = code.replace(
        /<div key=\{img\._id\} className="group relative bg-\[var\(--color-surface-elevated\)\] border border-\[var\(--color-border\)\] rounded-xl/g,
        '<motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} key={img._id} className="group relative bg-white border border-green-100 shadow-sm rounded-xl'
    );

    // closing div for gallery items
    code = code.replace(
        '</div>\n            ))}\n          </div>',
        '</motion.div>\n            ))}\n          </div>'
    );

    fs.writeFileSync(file, code);
    console.log('Gallery patched.');
}

patchProgrammes();
patchLeaderboards();
patchSchedule();
patchGallery();
