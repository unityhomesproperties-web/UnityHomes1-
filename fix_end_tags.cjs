const fs = require('fs');

const files = [
  'src/components/dashboards/LandlordDashboard.tsx',
  'src/components/dashboards/TenantDashboard.tsx',
  'src/components/dashboards/PmcDashboard.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/    <\/div>\n      \{showNotifications && \(/g, `      {showNotifications && (`);
  fs.writeFileSync(file, code);
});
