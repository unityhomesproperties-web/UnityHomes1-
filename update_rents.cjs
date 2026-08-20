const fs = require('fs');

function getRealisticRent(propertyName, description = '') {
  const text = (propertyName + ' ' + description).toLowerCase();
  
  if (text.includes('yaba') || text.includes('ikorodu') || text.includes('mainland') || text.includes('studio') || text.includes('self')) {
    return Math.floor(Math.random() * (800000 - 400000) + 400000); // 400k - 800k
  }
  
  if (text.includes('lekki') || text.includes('ikoyi') || text.includes('victoria island') || text.includes('vi') || text.includes('luxury') || text.includes('penthouse') || text.includes('mansion')) {
    return Math.floor(Math.random() * (8000000 - 2500000) + 2500000); // 2.5m - 8.0m
  }
  
  // default: Surulere, Gbagada, Ikeja GRA, etc.
  return Math.floor(Math.random() * (2500000 - 800000) + 800000); // 800k - 2.5m
}

function processDataTs() {
  let code = fs.readFileSync('src/data.ts', 'utf8');
  
  // Find all property objects and adjust price
  code = code.replace(/title:\s*'([^']+)'[\s\S]*?price:\s*(\d+)/g, (match, title, oldPrice) => {
    const newPrice = getRealisticRent(title);
    return match.replace(`price: ${oldPrice}`, `price: ${newPrice}`);
  });
  
  code = code.replace(/propertyName:\s*'([^']+)'[\s\S]*?rentAmount:\s*(\d+)/g, (match, title, oldPrice) => {
    const newPrice = getRealisticRent(title);
    return match.replace(`rentAmount: ${oldPrice}`, `rentAmount: ${newPrice}`);
  });
  
  fs.writeFileSync('src/data.ts', code);
}

function processDemoDataTs() {
  let code = fs.readFileSync('src/lib/demoData.ts', 'utf8');
  
  // Obiora, Magaji, Fashola properties
  code = code.replace(/name:\s*'([^']+)'[^}]*rent:\s*(\d+)/g, (match, title, oldRent) => {
    const newRent = getRealisticRent(title);
    return match.replace(`rent: ${oldRent}`, `rent: ${newRent}`);
  });

  // Shortlet properties don't have rent explicitly here? Wait they have totalPaid etc.
  // Actually, I should also adjust any other big numbers if they look like rent.
  
  fs.writeFileSync('src/lib/demoData.ts', code);
}

processDataTs();
processDemoDataTs();
