const fs = require('fs');
const path = require('path');
const file = path.join('admin-hudafestival-main', 'src', 'components', 'Sidebar.jsx');
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
    '              programmes: \'/programmes\',',
    '              programmes: \'/programmes\',\n              search: \'/search\','
);

fs.writeFileSync(file, c);
