const fs = require('fs');
let content = fs.readFileSync('src/pages/AreaIntelligencePage.tsx', 'utf8');

// Fix the button that has text-white on bg-white
content = content.replace(
  'className="inline-flex bg-white border-transparent text-white rounded-full px-4 py-2 text-sm font-semibold"',
  'className="inline-flex bg-white/20 border border-white/30 text-white rounded-full px-4 py-2 text-sm font-semibold"'
);

fs.writeFileSync('src/pages/AreaIntelligencePage.tsx', content);
console.log('Fixed Area Intelligence button.');
