const fs = require('fs');

function fix(filePath, replacements) {
    let c = fs.readFileSync(filePath, 'utf8');
    for (const r of replacements) {
        c = c.replace(r.search, r.replace);
    }
    fs.writeFileSync(filePath, c, 'utf8');
}

fix('admin-hudafestival-main/src/pages/GalleryPage.jsx', [
    { search: "if (!window.confirm('Are you sure you want to delete this image?')) return;", replace: "const confirmed = await confirmAction('Confirm', 'Are you sure you want to delete this image?');\n    if (!confirmed) return;" }
]);

fix('admin-hudafestival-main/src/pages/NotificationsPage.jsx', [
    { search: "if (!window.confirm('Delete this notification?')) return;", replace: "const confirmed = await confirmAction('Confirm', 'Delete this notification?');\n    if (!confirmed) return;" }
]);

fix('admin-hudafestival-main/src/pages/PendingResultPage.jsx', [
    { search: "if (window.confirm('Approve and publish all results in this batch?')) {", replace: "const confirmed = await confirmAction('Confirm', 'Approve and publish all results in this batch?');\n    if (confirmed) {" }
]);

fix('admin-hudafestival-main/src/pages/SchedulePage.jsx', [
    { search: "if(!window.confirm(`Delete venue \"${venueToDelete}\"?`)) return;", replace: "const confirmed = await confirmAction('Confirm', `Delete venue \"${venueToDelete}\"?`);\n    if (!confirmed) return;" },
    { search: "if (!window.confirm('Clear schedule for this programme?')) return;", replace: "const confirmed = await confirmAction('Confirm', 'Clear schedule for this programme?');\n    if (!confirmed) return;" }
]);

fix('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', [
    { search: "if (window.confirm('Remove this programme from topic management?')) {", replace: "const confirmed = await confirmAction('Confirm', 'Remove this programme from topic management?');\n                            if (confirmed) {" }
]);

console.log("Fixed window.confirms");