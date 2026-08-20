const fs = require('fs');
const dataTs = fs.readFileSync('src/data.ts', 'utf8');
const demoDataTs = fs.readFileSync('src/lib/demoData.ts', 'utf8');

const regex = /rentAmount:\s*(\d+)/g;
let match;
const amounts = new Set();
while ((match = regex.exec(dataTs)) !== null) {
  amounts.add(match[1]);
}
while ((match = regex.exec(demoDataTs)) !== null) {
  amounts.add(match[1]);
}
console.log("Rent amounts:", Array.from(amounts).join(', '));
