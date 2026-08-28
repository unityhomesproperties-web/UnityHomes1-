const fs = require('fs');
let content = fs.readFileSync('src/pages/AreaIntelligencePage.tsx', 'utf8');

content = content.replace(
  /<section className="bg-\[#6FBE45\] relative overflow-hidden flex-shrink-0">/,
  `<section className="relative overflow-hidden flex-shrink-0">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#6FBE45]/90" />
        </div>`
);

fs.writeFileSync('src/pages/AreaIntelligencePage.tsx', content);
console.log('Updated AreaIntelligencePage');
