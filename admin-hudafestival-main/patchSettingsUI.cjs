const fs = require('fs');
let content = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf8');

// Update state initialization
content = content.replace(
  `const [settings, setSettings] = useState({\n    isRegistrationOpen: true,\n    maintenanceMode: false,\n    maintenanceMessage: '',\n    venues: []\n  });`,
  `const [settings, setSettings] = useState({\n    isRegistrationOpen: true,\n    topicRegistrationEnabled: true,\n    maintenanceMode: false,\n    maintenanceMessage: '',\n    venues: []\n  });`
);

content = content.replace(
  `const [showConfirmToggleReg, setShowConfirmToggleReg] = useState(false);`,
  `const [showConfirmToggleReg, setShowConfirmToggleReg] = useState(false);\n  const [showConfirmToggleTopic, setShowConfirmToggleTopic] = useState(false);`
);

content = content.replace(
  `isRegistrationOpen: settingsRes.data.isRegistrationOpen ?? true,\n          maintenanceMode: settingsRes.data.maintenanceMode ?? false,`,
  `isRegistrationOpen: settingsRes.data.isRegistrationOpen ?? true,\n          topicRegistrationEnabled: settingsRes.data.topicRegistrationEnabled ?? true,\n          maintenanceMode: settingsRes.data.maintenanceMode ?? false,`
);

const handleToggleTopic = `
  const handleToggleTopic = async () => {
    try {
      const newVal = !settings.topicRegistrationEnabled;
      await api.patch('/settings', { topicRegistrationEnabled: newVal });
      setSettings({ ...settings, topicRegistrationEnabled: newVal });
      setShowConfirmToggleTopic(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating settings');
    }
  };
`;

content = content.replace(
  `const handleToggleRegistration = async () => {`,
  handleToggleTopic + `\n  const handleToggleRegistration = async () => {`
);

const topicToggleUI = `
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] mt-4">
            <div>
              <p className="text-[var(--color-text-heading)] font-medium">Enable Topic Registration</p>
              <p className="text-sm text-[var(--color-text-muted)]">When disabled, team leaders cannot submit new topic registrations regardless of individual programme topic modes.</p>
            </div>
            <button 
              onClick={() => setShowConfirmToggleTopic(true)}
              className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 \${settings.topicRegistrationEnabled ? 'bg-green-500' : 'bg-gray-300'}\`}
            >
              <span className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${settings.topicRegistrationEnabled ? 'translate-x-6' : 'translate-x-1'}\`} />
            </button>
          </div>
`;

content = content.replace(
  `        </div>\n  \n        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">`,
  topicToggleUI + `        </div>\n  \n        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">`
);

const topicModalUI = `
        <Modal 
          isOpen={showConfirmToggleTopic}
          title={settings.topicRegistrationEnabled ? "Disable Topic Registration" : "Enable Topic Registration"}
          message={settings.topicRegistrationEnabled 
            ? "Are you sure you want to disable topic registrations? Team leaders will no longer be able to submit topics." 
            : "Are you sure you want to enable topic registrations?"}
          onConfirm={handleToggleTopic}
          onCancel={() => setShowConfirmToggleTopic(false)}
          confirmText={settings.topicRegistrationEnabled ? "Disable" : "Enable"}
        />
`;

content = content.replace(
  `      </div>\n    );\n  };\n  \n  export default SettingsPage;`,
  topicModalUI + `      </div>\n    );\n  };\n  \n  export default SettingsPage;`
);

fs.writeFileSync('src/pages/SettingsPage.jsx', content);
