const fs = require('fs');
const lines = fs.readFileSync('src/pages/TeamLeaderDashboard_BACKUP.jsx', 'utf8').split('\n');

let dash = [];
let skip = false;
let modalSkip = false;

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    
    // Skip topic states
    if (l.includes('[myTopics') || l.includes('[topicCategories') || l.includes('[topicProgrammes') || l.includes('[topicCategory') || l.includes('[otherTopics') || l.includes('[showTopicForm') || l.includes('[topicForm')) continue;
    if (l.includes("const handleTopicSubmit = ")) {
        // skip this function
        skip = true;
    }
    if (skip && l === '  };' && lines[i+1].includes('// Helper for modal cascade')) {
        skip = false;
        continue;
    }
    if (skip && l === '  };' && lines[i-1].includes('setSubmitting(false);')) {
        skip = false;
        continue;
    }

    if (l.includes('const loadOtherTopics = ')) skip = true;
    if (skip && l.includes('setOtherTopics(prev')) {
        skip = false; i+=3; continue;
    }

    if (l.includes("{activeTab === 'topics' ? 'Submit Topic' : 'New Registration'}")) {
        dash.push("                'New Registration'");
        continue;
    }
    if (l.includes("{activeTab === 'topics' && (")) {
        modalSkip = true;
    }
    if (modalSkip && l.includes("          )}")) {
        modalSkip = false;
        continue;
    }
    if (l.includes("Submit Topic Modal")) {
        dash.pop(); // remove {/*
        dash.pop(); // remove ===
        modalSkip = true;
    }
    if (modalSkip && l.includes("</Modal>")) {
        modalSkip = false;
        continue;
    }
    if (l.includes("{ key: 'topics',        label: 'Topic Registrations'")) continue;
    if (l.includes("setActiveTab('topics')")) {
        dash.push(l.replace("setActiveTab('topics')", "setActiveTab('registrations')"));
        continue;
    }
    if (l.includes("if (activeTab === 'topics') setShowTopicForm(true); else setShowForm(true);")) {
        dash.push("              setShowForm(true);");
        continue;
    }

    if (!skip && !modalSkip) dash.push(l);
}

fs.writeFileSync('src/pages/TeamLeaderDashboard.jsx', dash.join('\n'));
