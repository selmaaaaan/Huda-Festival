const fs = require('fs');
const file = 'src/pages/RegistrationReviewPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
const statesToAdd = `
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [visibleProgrammes, setVisibleProgrammes] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
`;
content = content.replace("const [assignCategoryFilter, setAssignCategoryFilter] = useState('ALL');", "const [assignCategoryFilter, setAssignCategoryFilter] = useState('ALL');\n" + statesToAdd);

// 2. Add useEffect
const useEffectToAdd = `
  useEffect(() => {
    const computeVisibleProgrammes = async () => {
      setIsFiltering(true);
      let baseProgrammes = [...programmes];

      if (filterTeam) {
        if (filterStatus === 'UNREGISTERED') {
          try {
            const { data } = await api.get(\`/teams/\${filterTeam}/unregistered-programmes\`);
            baseProgrammes = data;
          } catch(e) { console.error(e); }
        } else if (filterStatus === 'REGISTERED') {
          try {
            const { data } = await api.get(\`/registrations?team=\${filterTeam}&limit=1000\`);
            const regs = data.registrations || data || [];
            const registeredProgIds = regs.map(r => r.programme._id || r.programme);
            baseProgrammes = baseProgrammes.filter(p => registeredProgIds.includes(p._id));
          } catch(e) { console.error(e); }
        }
      }

      if (filterCategory !== 'ALL') {
        baseProgrammes = baseProgrammes.filter(p => p.category === filterCategory);
      }
      
      setVisibleProgrammes(baseProgrammes);
      setIsFiltering(false);
    };

    if (programmes.length > 0) {
       computeVisibleProgrammes();
    } else {
       setVisibleProgrammes([]);
    }
  }, [filterStatus, filterTeam, filterCategory, programmes]);
`;

content = content.replace("// Fetch programmes and teams", useEffectToAdd + "\n  // Fetch programmes and teams");

// 3. Update Left Panel UI
const oldUI = `<div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-[var(--color-text-muted)]">Loading...</div>
          ) : programmes.map(prog => (`;

const newUI = `<div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] space-y-3">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="ALL">All Status</option>
              <option value="REGISTERED" disabled={!filterTeam}>Registered (Requires Team)</option>
              <option value="UNREGISTERED" disabled={!filterTeam}>Unregistered (Requires Team)</option>
            </select>
            
            <select
              value={filterTeam}
              onChange={e => {
                setFilterTeam(e.target.value);
                if (!e.target.value && filterStatus !== 'ALL') setFilterStatus('ALL');
              }}
              className="w-full text-xs px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">All Teams</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
          {loading || isFiltering ? (
            <div className="p-4 text-sm text-[var(--color-text-muted)]">Loading...</div>
          ) : visibleProgrammes.map(prog => (`;

content = content.replace(oldUI, newUI);

fs.writeFileSync(file, content);
console.log("Patched successfully");
