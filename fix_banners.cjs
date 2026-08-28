const fs = require('fs');

function updateBanners(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace bg-[#F5FAF2]/95 with bg-black/40
  // Or remove it entirely? Let's use bg-black/40 so the text remains readable.
  content = content.replace(/bg-\[#F5FAF2\]\/95/g, 'bg-black/40');
  content = content.replace(/bg-\[#F5FAF2\]\/90/g, 'bg-black/40');
  content = content.replace(/bg-\[#6FBE45\]\/90/g, 'bg-black/40'); // In case any remain
  
  // Also we need to restore white text where it was changed to #132A1D inside the hero banners
  // Previously we replaced text-white with text-[#132A1D] in these sections
  const blocks = content.split(/(<section[^>]*>[\s\S]*?<\/section>|<div[^>]*min-h-\[320px\][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>|<div[^>]*min-h-\[220px\][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/g);
  
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].includes('bg-black/40')) {
      blocks[i] = blocks[i].replace(/text-\[#132A1D\]/g, 'text-white');
      blocks[i] = blocks[i].replace(/stroke="#132A1D"/g, 'stroke="white"');
      blocks[i] = blocks[i].replace(/bg-\[#132A1D\]\/10/g, 'bg-white/20');
      blocks[i] = blocks[i].replace(/border-\[#132A1D\]\/20/g, 'border-white/30');
      blocks[i] = blocks[i].replace(/bg-\[#132A1D\]/g, 'bg-white');
    }
  }
  
  content = blocks.join('');
  
  // Specific fix for ProfessionalsPage grid card banners
  if (file.includes('ProfessionalsPage.tsx') && content.includes('bg-black/40')) {
     let profSplit = content.split(/(<div className="relative overflow-hidden[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)/g);
     for (let i = 0; i < profSplit.length; i++) {
       if (profSplit[i].includes('bg-black/40')) {
          profSplit[i] = profSplit[i].replace(/text-\[#132A1D\]/g, 'text-white');
          profSplit[i] = profSplit[i].replace(/text-stone-600/g, 'text-stone-200');
       }
     }
     content = profSplit.join('');
  }
  
  if (file.includes('WaitlistPage.tsx')) {
    content = content.replace(/bg-\[#F5FAF2\]\/95/g, 'bg-black/40');
    content = content.replace(/text-\[#111827\]/g, 'text-white'); 
  }
  
  // Remove "Join Waitlist" banners
  // The structure is usually:
  // {/* Premium CTA Banner */}
  // <section ... > ... </section>
  // We can just regex this out if it contains "Join The Waitlist"
  
  content = content.replace(/\{\/\* Premium CTA Banner \*\/\}[\s\S]*?<section[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi, '');
  content = content.replace(/\{\/\* CLOSING CALL TO ACTION BANNER \*\/\}[\s\S]*?<section[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi, '');
  
  fs.writeFileSync(file, content);
  console.log('Updated', file);
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
  'src/components/ProfessionalsPage.tsx',
  'src/pages/WaitlistPage.tsx'
];

files.forEach(updateBanners);
