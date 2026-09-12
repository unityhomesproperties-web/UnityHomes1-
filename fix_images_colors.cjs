const fs = require('fs');

// 1. WaitlistModal.tsx -> real-estate.jpg
let waitlistContent = fs.readFileSync('src/components/WaitlistModal.tsx', 'utf8');
waitlistContent = waitlistContent.replace(
  'img: "/images/agent.jpg"',
  'img: "/images/real-estate.jpg"'
);
fs.writeFileSync('src/components/WaitlistModal.tsx', waitlistContent);

// 2. HomePage.tsx -> community.jpg
let homeContent = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');
homeContent = homeContent.replace(
  'image: "/images/area_intelligence.jpg"',
  'image: "/images/community.jpg"'
);
fs.writeFileSync('src/pages/HomePage.tsx', homeContent);

// 3. AreaIntelligencePage.tsx -> light green button
let areaContent = fs.readFileSync('src/pages/AreaIntelligencePage.tsx', 'utf8');
areaContent = areaContent.replace(
  'className="inline-flex bg-white/20 border border-white/30 text-white rounded-full px-4 py-2 text-sm font-semibold"',
  'className="inline-flex bg-[var(--color-brand-fresh)] border-transparent text-white rounded-full px-4 py-2 text-sm font-semibold"'
);
fs.writeFileSync('src/pages/AreaIntelligencePage.tsx', areaContent);

console.log('Fixed pop-up image, hero slider image, and area intelligence button color.');
