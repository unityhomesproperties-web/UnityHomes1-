const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between"',
  'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between"'
);

content = content.replace(
  'className="h-8 md:h-10 w-auto object-contain"',
  'className="h-12 md:h-16 w-auto object-contain scale-110 origin-left"'
);

content = content.replace(
  'className="h-8 w-auto object-contain"',
  'className="h-12 w-auto object-contain scale-110 origin-left"'
);

fs.writeFileSync('src/components/Layout.tsx', content);
console.log('Logo size increased.');
