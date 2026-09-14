const fs = require('fs');
let code = fs.readFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', 'utf8');

// 1. Initial State
code = code.replace(
    /const \[topicForm, setTopicForm\] = useState\(\{ programmeId: '', candidateId: '', topic: '' \}\);/g,
    `const [topicForm, setTopicForm] = useState({ programmeId: '', candidateId: '', topic: '', attachment: '' });`
);

// 2. setTopicForm resets
code = code.replace(
    /setTopicForm\(\{ programmeId: '', candidateId: '', topic: '' \}\);/g,
    `setTopicForm({ programmeId: '', candidateId: '', topic: '', attachment: '' });`
);
code = code.replace(
    /setTopicForm\(f => \(\{ \.\.\.f, programmeId: '', topic: '', candidateId: '' \}\)\);/g,
    `setTopicForm(f => ({ ...f, programmeId: '', topic: '', candidateId: '', attachment: '' }));`
);
code = code.replace(
    /setTopicForm\(f => \(\{ \.\.\.f, programmeId: val, topic: '', candidateId: '' \}\)\);/g,
    `setTopicForm(f => ({ ...f, programmeId: val, topic: '', candidateId: '', attachment: '' }));`
);

// 3. submit form payload
code = code.replace(
    /candidateId: topicForm\.candidateId \|\| undefined,\n\s*topic: topicForm\.topic,/,
    `candidateId: topicForm.candidateId || undefined,\n        topic: topicForm.topic,\n        attachment: topicForm.attachment,`
);

// 4. Update the topicMode logic and UI
const uiOld = `{selectedTopicProg?.topicMode === 'fixed-list' ? (
                        <select
                          value={topicForm.topic}
                          onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                        >
                          <option value="">Select a topic…</option>
                          {selectedTopicProg?.topicList?.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={topicForm.topic}
                          onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                          placeholder="Enter your topic…"
                          className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                        />
                      )}`;

const uiNew = `{['fixed-list', 'fixed-list-global'].includes(selectedTopicProg?.topicMode) ? (
                        <select
                          value={topicForm.topic}
                          onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                        >
                          <option value="">Select a topic…</option>
                          {selectedTopicProg?.topicList?.map(t => {
                            const isGlobalTaken = selectedTopicProg.topicMode === 'fixed-list-global' && otherTopics[topicForm.programmeId]?.some(ot => ot.topic === t);
                            return (
                                <option key={t} value={t} disabled={isGlobalTaken}>
                                    {t} {isGlobalTaken ? '(Taken)' : ''}
                                </option>
                            );
                          })}
                        </select>
                      ) : (
                        <div className="space-y-4">
                            <input
                            type="text"
                            value={topicForm.topic}
                            onChange={e => setTopicForm(f => ({ ...f, topic: e.target.value }))}
                            placeholder="Enter your topic…"
                            className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                            />
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                                    Attachment (YouTube Link / Image URL)
                                </label>
                                <input
                                    type="text"
                                    value={topicForm.attachment}
                                    onChange={e => setTopicForm(f => ({ ...f, attachment: e.target.value }))}
                                    placeholder="Optional link..."
                                    className="w-full px-3 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>
                      )}`;
code = code.replace(uiOld, uiNew);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx', code);
console.log('Patched TeamLeaderDashboard.jsx');
