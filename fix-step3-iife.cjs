const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

// The end of Step 3 looks like:
//                   )}
//                 </motion.div>
//               )}
// 
//               <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">

code = code.replace(
    /<\/ul>\n\s*<\/div>\n\s*\)\}\n\s*<\/motion\.div>\n\s*\)\}\n\n\s*<div className="flex justify-end gap-3 pt-4 border-t/s,
    `</ul>\n                    </div>\n                  )}\n                </motion.div>\n                  );\n                })()}\n\n              <div className="flex justify-end gap-3 pt-4 border-t`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Fixed Step 3 closing IIFE');
