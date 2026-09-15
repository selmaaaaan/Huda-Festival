const fs = require('fs');
let lines = fs.readFileSync('src/pages/TeamLeaderDashboard_BACKUP.jsx', 'utf8').split('\n');

// Build TeamLeaderDashboard.jsx
let dashLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Remove states
    if (line.includes('const [myTopics, setMyTopics] = useState([]);')) continue;
    if (line.includes('const [topicCategories, setTopicCategories] = useState([]);')) continue;
    if (line.includes('const [topicProgrammes, setTopicProgrammes] = useState([]);')) continue;
    if (line.includes('const [topicCategory, setTopicCategory] = useState(')) continue;
    if (line.includes('const [otherTopics, setOtherTopics] = useState({}')) continue;
    if (line.includes('const [showTopicForm, setShowTopicForm] = useState(false);')) continue;
    if (line.includes('const [topicForm, setTopicForm]')) continue;
    
    // Remove the topic tab
    if (line.includes("{ key: 'topics',        label: 'Topic Registrations', icon: BookOpen, count: myTopics.length },")) continue;

    // Remove the Topic rendering block
    if (line.includes("{activeTab === 'topics' && (")) {
        skip = true;
    }
    if (skip && line.includes(")} // END TOPIC TAB")) {
        skip = false;
        continue;
    }
    
    // Remove the Topic modal block
    if (line.includes("Submit Topic Modal")) {
        skip = true;
        // Also remove the {/* comment above it
        if (dashLines[dashLines.length - 1].includes("-------------")) dashLines.pop();
        if (dashLines[dashLines.length - 1].includes("{/*")) dashLines.pop();
    }
    if (skip && line.includes("</Modal>") && i > 500) {
        skip = false;
        continue;
    }
    
    if (!skip) dashLines.push(line);
}
fs.writeFileSync('src/pages/TeamLeaderDashboard.jsx', dashLines.join('\n'));
