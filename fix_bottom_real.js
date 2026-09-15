const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', 'utf8');

const strStart = '              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">';
const strEnd = '              </div>';

const idxStart = c.indexOf(strStart);
if (idxStart !== -1) {
    const idxEnd = c.indexOf(strEnd, idxStart) + strEnd.length;
    const replace = `              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                <Button variant="ghost" type="button" onClick={() => setShowTopicForm(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Submit Topic</Button>
              </div>`;
    c = c.substring(0, idxStart) + replace + c.substring(idxEnd);
    fs.writeFileSync('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx', c, 'utf8');
    console.log("REMOVED BY INDEX");
}