const fs = require('fs');

let content = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf-8');

// Replace stats logic
content = content.replace(
    'const compliant = candidates.filter(c => c.bylawStatus?.isCompliant).length;\n        const pending = total - compliant;\n        return { total, compliant, pending };',
    `const compliant = candidates.filter(c => c.bylawStatus?.status === 'compliant').length;
        const violated = candidates.filter(c => c.bylawStatus?.status === 'violated').length;
        const pending = candidates.filter(c => c.bylawStatus?.status === 'pending' || !c.bylawStatus?.status).length;
        return { total, compliant, pending, violated };`
);

// Add violated box
const pendingBoxStr = `<div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-orange-500 uppercase mb-1">Pending</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.pending}</div>
                    </div>`;

const newBoxesStr = `${pendingBoxStr}
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-red-500 uppercase mb-1">Violated</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.violated}</div>
                    </div>`;

content = content.replace(pendingBoxStr, newBoxesStr);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', content, 'utf-8');
console.log('UI Patched successfully');