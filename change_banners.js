const fs = require('fs');

function updateBanners(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Let's replace the overlay
  // First, we find the absolute inset-0 bg-[#6FBE45]/90 and replace it with a light overlay bg-[#F0F8F4]/90
  // Then we need to change text-white inside the banner.
  
  // Actually, to make it easier to read the text on a very light background, we need text-[#132A1D].
  
  let newContent = content.replace(/className="([^"]*)bg-\[#6FBE45\]\/90([^"]*)"/g, 'className="$1bg-[#F5FAF2]/95$2"');
  newContent = newContent.replace(/className="([^"]*)bg-\[#6FBE45\]\/85([^"]*)"/g, 'className="$1bg-[#F5FAF2]/95$2"');
  newContent = newContent.replace(/className="([^"]*)bg-\[#6FBE45\]\/80([^"]*)"/g, 'className="$1bg-[#F5FAF2]/95$2"');
  
  // LandingPage CTA has `text-white` in the section wrapper, and text-white in children.
  // WaitlistPage has text-white. 
  // AboutPage has text-white on section, and text-white/90 on h4, text-white on h1.
  
  // We can just change text-white to text-[#132A1D] in these specific sections.
  // This might be tricky if it replaces text-white elsewhere in the file.
  
  // So we only replace text-white in the section block.
  // Let's split by <section and </section> (or <div ... min-h-[320px] for LandingPage cards).
  
  const blocks = newContent.split(/(<section[^>]*>[\s\S]*?<\/section>|<div[^>]*min-h-\[320px\][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>|<div[^>]*min-h-\[220px\][^>]*>[\s\S]*?<\/div>\s*<\/div>)/g);
  
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].includes('bg-[#F5FAF2]/95')) {
      // Replace text-white with text-[#132A1D]
      blocks[i] = blocks[i].replace(/text-white/g, 'text-[#132A1D]');
      // Replace stroke="white" with stroke="#132A1D"
      blocks[i] = blocks[i].replace(/stroke="white"/g, 'stroke="#132A1D"');
    }
  }
  
  newContent = blocks.join('');
  fs.writeFileSync(file, newContent);
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
