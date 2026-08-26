const fs = require('fs');
const content = fs.readFileSync('src/pages/ProfessionalsPage.tsx', 'utf-8');
const match = content.match(/description:\s*'([^']+)'/g);
console.log(match);
