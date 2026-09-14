const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

const regex = /<button[\s\S]*?onClick=\{\(\) => handleToggleCategory\(cat\)\}[\s\S]*?className=\{`relative[\s\S]*?<\/button>/;

const newButton = `<button 
                            onClick={() => handleToggleCategory(cat)}
                            style={{ backgroundColor: isOpen ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
                          >
                            <span 
                                style={{ 
                                    display: 'inline-block', 
                                    width: '18px', 
                                    height: '18px', 
                                    backgroundColor: 'white', 
                                    borderRadius: '50%', 
                                    position: 'absolute', 
                                    top: '3px', 
                                    left: isOpen ? '23px' : '3px',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }} 
                            />
                          </button>`;

code = code.replace(regex, newButton);

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Fixed toggle button styles');
