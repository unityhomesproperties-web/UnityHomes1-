const fs = require('fs');

function replaceInFile(file, search, replace) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(new RegExp(search, 'g'), replace);
  fs.writeFileSync(file, content);
}

const files = [
  'src/pages/VisionPage.tsx',
  'src/pages/MissionPage.tsx',
  'src/pages/WaitlistPage.tsx',
  'src/components/dashboards/TenantDashboard.tsx',
  'src/components/dashboards/AdminDashboard.tsx',
  'src/pages/HomePage.tsx',
  'src/data.ts'
];

files.forEach(file => {
  replaceInFile(file, '1480714378408-67cf736cb474', '1449844908441-8829872d2607'); // Vision
  replaceInFile(file, '1541888086925-ebcf3819e933', '1504307651254-35680f356f12'); // Mission & waitlist surveyor
  replaceInFile(file, '1531123897727-8f129e1bf98c', '1531123897727-8f129e1688ce'); // Avatar
  replaceInFile(file, '1541881591873-455de31cebd8', '1560518883-ce09059eeffa'); // HomePage
  replaceInFile(file, '1622771739844-6a9f6d5f14af', '1522771739844-6a9f6d5f14af'); // data.ts
});

console.log("Replaced 404 images");
