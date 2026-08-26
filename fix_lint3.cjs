const fs = require('fs');

function replaceInFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    for (let r of replacements) {
        content = content.split(r.find).join(r.replace);
    }
    fs.writeFileSync(file, content);
}

replaceInFile('src/components/dashboards/ShortletDashboard.tsx', [
    { find: 'report.urgency ===', replace: '(report as any).urgency ===' },
    { find: 'log.remittanceStatus ===', replace: '(log as any).remittanceStatus ===' },
    { find: 'log.remittanceStatus', replace: '(log as any).remittanceStatus' },
    { find: 'log.disputeReason', replace: '(log as any).disputeReason' }
]);

console.log('Fixed fix_lint3');
