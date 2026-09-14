const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

const target = `const handleToggleTeamTopic = async (team) => {\\n    try {\\n      const newVal = !(team.isTopicRegistrationOpen !== false);\\n      await api.put(/teams/, { isTopicRegistrationOpen: newVal });\\n      setTeams(teams.map(t => t._id === team._id ? { ...t, isTopicRegistrationOpen: newVal } : t));\\n    } catch (err) {\\n      alert(err.response?.data?.message || \\'Error\\');\\n    }\\n  };\\n\\n  const handleOpenTeamModal = (team = null) => {`;

const replacement = `const handleToggleTeamTopic = async (team) => {
    try {
      const newVal = !(team.isTopicRegistrationOpen !== false);
      await api.put(\`/teams/\${team._id}\`, { isTopicRegistrationOpen: newVal });
      setTeams(teams.map(t => t._id === team._id ? { ...t, isTopicRegistrationOpen: newVal } : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating team topic registration');
    }
  };

  const handleOpenTeamModal = (team = null) => {`;

txt = txt.replace(target, replacement);
fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', txt);
