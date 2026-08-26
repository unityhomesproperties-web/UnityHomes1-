const fs = require('fs');
let content = fs.readFileSync('src/lib/database.ts', 'utf-8');
content = content.replace('resolve(db);', 'resolve(db as any);');
fs.writeFileSync('src/lib/database.ts', content);
