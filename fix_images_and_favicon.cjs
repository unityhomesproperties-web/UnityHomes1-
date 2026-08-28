const fs = require('fs');

// 1. Fix favicon in index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/href="\/logo\.svg"/g, 'href="/favicon.svg"');
indexHtml = indexHtml.replace(/href="\/vite\.svg"/g, 'href="/favicon.svg"');
fs.writeFileSync('index.html', indexHtml);
console.log('Updated index.html with favicon.svg');

// 2. Fix images in the pages
const pages = {
  'src/pages/AboutPage.tsx': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80', // Team at work
  'src/pages/VisionPage.tsx': 'https://images.unsplash.com/photo-1480714378408-67cf736cb474?auto=format&fit=crop&q=80', // Modern city/vision
  'src/pages/MissionPage.tsx': 'https://images.unsplash.com/photo-1541888086925-ebcf3819e933?auto=format&fit=crop&q=80', // Building/Foundation
  'src/pages/ContactPage.tsx': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80', // Contact/Office
  'src/pages/ServicesPage.tsx': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80', // Handing over keys
  'src/pages/ProfessionalsPage.tsx': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80', // Architects meeting
  'src/pages/AreaIntelligencePage.tsx': 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80', // Map view
  'src/pages/WaitlistPage.tsx': 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&q=80' // Family moving in (Waitlist Hero)
};

for (const [file, newImg] of Object.entries(pages)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the main hero banner image
    // Find the first <img ... alt="Architecture Background" or similar
    // It's usually inside <div className="absolute inset-0 z-0">
    
    content = content.replace(/<img src="https:\/\/images\.unsplash\.com\/photo-[^"]*" alt="[^"]*" className="w-full h-full object-cover"/i, 
      `<img src="${newImg}" alt="Hero Banner" className="w-full h-full object-cover"`);
      
    // WaitlistPage has specific images that might need precise targeting
    if (file === 'src/pages/WaitlistPage.tsx') {
      content = content.replace(/<img src="https:\/\/images\.unsplash\.com\/photo-1600596542815[^"]*" alt="Modern home exterior" className="w-full h-full object-cover" \/>/i, 
        `<img src="${newImg}" alt="Happy family at new home" className="w-full h-full object-cover" />`);
    }

    fs.writeFileSync(file, content);
    console.log(`Updated images for ${file}`);
  }
}

