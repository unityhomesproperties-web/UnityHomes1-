const fs = require('fs');
let code = fs.readFileSync('src/components/dashboards/PmcDashboard.tsx', 'utf8');

// Find the start of TAB 2: LANDLORD CLIENTS
// Check if "Group properties for Landlord Clients View" is there
if (code.includes('Group properties for Landlord Clients View')) {
  console.log("Found the target section.");
}
