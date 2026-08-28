const fs = require('fs');

function addBackgroundToSection(file, searchPattern, overlayColor, imageUrl) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // Example pattern to find: `<section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#6FBE45] overflow-hidden">`
  // We want to remove the bg-[...] class and inject the image background inside.
  
  let newContent = content.replace(
    /(<section[^>]*?className="[^"]*?)(\s+bg-\[[^\]]+\])(\s*[^"]*"\s*>)/g,
    (match, p1, p2, p3) => {
      // Check if it's already got the absolute inset image
      return p1 + p3 + `\n        {/* Background Image & Overlay */}\n        <div className="absolute inset-0 z-0">\n          <img src="${imageUrl}" alt="Architecture Background" className="w-full h-full object-cover" />\n          <div className="absolute inset-0 ${overlayColor}" />\n        </div>`;
    }
  );

  // special case for CLOSING CALL TO ACTION BANNER in LandingPage (no relative, etc.)
  if (file.includes('LandingPage.tsx')) {
    newContent = newContent.replace(
      /(<section className="py-16)\s+bg-\[#[A-F0-9]+\](\s+text-\[#[A-F0-9]+\] px-4 md:px-8 w-full border-t border-stone-200"\s*>)/g,
      (match, p1, p2) => {
        return p1 + ' relative' + p2 + `\n        {/* Background Image & Overlay */}\n        <div className="absolute inset-0 z-0">\n          <img src="${imageUrl}" alt="Architecture Background" className="w-full h-full object-cover" />\n          <div className="absolute inset-0 ${overlayColor}" />\n        </div>\n        <div className="relative z-10 w-full h-full">`;
      }
    );
    // and close the div for LandingPage
    newContent = newContent.replace(
      /(\s*)(<\/div>\s*<\/section>)/g,
      (match, p1, p2) => {
        // Just need to make sure we don't accidentally close multiple. 
        // Actually, let's just do a manual replace for LandingPage CTA
        return match;
      }
    );
  }
  
  fs.writeFileSync(file, newContent);
  console.log(`Updated ${file}`);
}

const images = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80"
];

// Let's use standard light green overlay `#6FBE45`/90 for all to match "light green covers"
const overlay = "bg-[#6FBE45]/90";

const files = [
  'src/pages/AboutPage.tsx',
  'src/pages/VisionPage.tsx',
  'src/pages/MissionPage.tsx',
  'src/pages/ContactPage.tsx',
  'src/pages/ServicesPage.tsx',
  'src/pages/ProfessionalsPage.tsx',
  'src/pages/AreaIntelligencePage.tsx'
];

files.forEach((f, i) => addBackgroundToSection(f, '', overlay, images[i % images.length]));

