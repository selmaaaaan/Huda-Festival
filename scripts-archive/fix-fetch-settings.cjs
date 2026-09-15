const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

// Replace fetchSettings to include all fields
const fetchSettingsRegex = /setSettings\(\{\s*isRegistrationOpen:[\s\S]*?venues: res\.data\.venues \|\| \[\]\s*\}\);/;

const fixedFetchSettings = `setSettings(prev => ({
            ...prev,
            isRegistrationOpen: res.data.isRegistrationOpen ?? true,
            topicRegistrationEnabled: res.data.topicRegistrationEnabled ?? true,
            maintenanceMode: res.data.maintenanceMode ?? false,
            maintenanceMessage: res.data.maintenanceMessage ?? '',
            categoryRegistrationStatus: res.data.categoryRegistrationStatus || prev.categoryRegistrationStatus,
            categoryTopicRegistrationStatus: res.data.categoryTopicRegistrationStatus || prev.categoryTopicRegistrationStatus,
            categoryItemLimits: res.data.categoryItemLimits || prev.categoryItemLimits,
            venues: res.data.venues || []
          }));`;

code = code.replace(fetchSettingsRegex, fixedFetchSettings);
fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', code);
console.log('Fixed fetchSettings to include missing fields');
