const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

content = content.replace('              {/* Mobile overlay for text readability */}\n              <div className="absolute inset-0 bg-black/60 lg:hidden"></div>', '');
// Also try to replace it without the comment just in case
content = content.replace('<div className="absolute inset-0 bg-black/60 lg:hidden"></div>', '');

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Overlay removed.');
