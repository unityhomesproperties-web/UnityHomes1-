const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

const regex = /\[\s*\`12 new landlord subscription inquiries received this week\.\`,\s*\`Platform occupancy across all managed properties is 88 percent\.\`,\s*\`3 quit notices are pending admin review\.\`,\s*\`7 landlords have not received a monthly statement this period\.\`,\s*\`Subscription revenue this month is ₦4,250,000\.\`,\s*\`5 property requests from landlords are awaiting admin approval\.\`\s*\]/g;

const replacement = `[
                    \`\${inquiries.length} new landlord subscription inquiries received this week.\`,
                    \`Platform occupancy across all managed properties is \${properties.length > 0 ? Math.round(properties.filter(p => p.status === 'Rented').length / properties.length * 100) : 0} percent.\`,
                    \`\${damageReports.length} damage reports are pending admin review.\`,
                    \`\${tenantApps.filter(t => t.status === 'Pending').length} tenant applications are awaiting review.\`,
                    \`\${pmcApps.filter(p => p.status === 'Pending').length} PMC applications are awaiting approval.\`
                  ]`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
