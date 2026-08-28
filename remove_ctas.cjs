const fs = require('fs');

function removeCTA(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Regex to remove the CTA section that contains "Join The Waitlist" or "Join the Waitlist"
  // It usually starts with <section className="relative py-24 or similar
  content = content.replace(/\{\/\*\s*Premium CTA Banner[^]*?\*\/\}[\s\S]*?<section[\s\S]*?(?:Join [Tt]he Waitlist|Join the Unity Homes journey)[\s\S]*?<\/section>/gi, '');
  content = content.replace(/\{\/\*\s*CLOSING CALL TO ACTION BANNER[^]*?\*\/\}[\s\S]*?<section[\s\S]*?(?:Join [Tt]he Waitlist)[\s\S]*?<\/section>/gi, '');

  fs.writeFileSync(file, content);
  console.log('Removed CTAs from', file);
}

const files = [
  'src/pages/AboutPage.tsx',
  'src/pages/VisionPage.tsx',
  'src/pages/MissionPage.tsx',
  'src/pages/ContactPage.tsx',
  'src/pages/ServicesPage.tsx',
  'src/pages/ProfessionalsPage.tsx',
  'src/pages/AreaIntelligencePage.tsx',
  'src/components/LandingPage.tsx',
  'src/components/ProfessionalsPage.tsx'
];

files.forEach(removeCTA);
