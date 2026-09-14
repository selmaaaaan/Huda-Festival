const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/components/GettingStartedCard.jsx', 'utf8');

// The main bar
txt = txt.replace(/<div className="w-full bg-\[var\(--color-bg\)\] border border-\[var\(--color-border\)\] rounded-full h-2">\s*<div\s*className="bg-\[var\(--color-primary\)\] h-2 rounded-full transition-all duration-1000"/g, 
  '<div className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full h-3 overflow-hidden">\n                <div\n                  className="bg-[var(--color-primary)] h-full rounded-full transition-all duration-1000"');

// The sub-bars (registration)
txt = txt.replace(/<div className="w-full bg-\[var\(--color-bg\)\] border border-\[var\(--color-border\)\] rounded-full h-1.5">\s*<div className="bg-\[var\(--color-primary\)\] h-1.5 rounded-full"/g, 
  '<div className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full h-2.5 overflow-hidden">\n                                        <div className="bg-[var(--color-primary)] h-full rounded-full"');

// The sub-bars (topic)
txt = txt.replace(/<div className="w-full bg-\[var\(--color-bg\)\] border border-\[var\(--color-border\)\] rounded-full h-1.5">\s*<div className="bg-purple-500 h-1.5 rounded-full"/g, 
  '<div className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full h-2.5 overflow-hidden">\n                                        <div className="bg-purple-500 h-full rounded-full"');


fs.writeFileSync('admin-hudafestival-main/src/components/GettingStartedCard.jsx', txt);
