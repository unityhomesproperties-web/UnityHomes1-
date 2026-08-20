const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

const regex = /\{\[\s*"Pending quit notices awaiting review before release\.",\s*"Pending property requests from landlords\.",\s*"Pending bank account change requests with hours remaining on 48-hour hold\.",\s*"Overdue subscription payments\.",\s*"Pending tenant registration approvals\.",\s*"Disputed payments awaiting admin mediation\."\s*\]\.map\(\(alert, i\) => \([\s\S]*?\}\)/;

const replacement = `{ [
                    { text: \`\${damageReports.length} pending damage reports awaiting review before release.\`, tab: 'Properties' },
                    { text: \`\${inquiries.filter(i => i.status === 'Pending').length} pending property inquiries from landlords.\`, tab: 'Properties' },
                    { text: \`1 pending bank account change requests with hours remaining on 48-hour hold.\`, tab: 'Finance' },
                    { text: \`3 overdue subscription payments.\`, tab: 'Finance' },
                    { text: \`\${tenantApps.filter(t => t.status === 'Pending').length} pending tenant registration approvals.\`, tab: 'Tenants' },
                    { text: \`\${pmcApps.filter(p => p.status === 'Pending').length} pending PMC applications awaiting admin review.\`, tab: 'PMCs' }
                  ].map((alert, i) => (
                    <div key={i} onClick={() => setActiveTab(alert.tab)} className="flex items-start space-x-3 p-3 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors">
                      <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      <span className="text-xs font-semibold text-rose-900 leading-snug">{alert.text}</span>
                    </div>
                  ))}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
