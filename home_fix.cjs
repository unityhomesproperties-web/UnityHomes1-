const fs = require('fs');

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// The closing CTA banner in HomePage starts around line 377
// Let's replace the whole section by matching `<section className="relative py-24 sm:py-32`
content = content.replace(/<section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center">[\s\S]*?<\/section>/gi, '');

fs.writeFileSync('src/pages/HomePage.tsx', content);
