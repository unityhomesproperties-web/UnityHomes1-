const fs = require('fs');
const content = fs.readFileSync('src/pages/ProfessionalsPage.tsx', 'utf-8');
console.log(content.includes('state={{ role: prof.roleId }}'));
