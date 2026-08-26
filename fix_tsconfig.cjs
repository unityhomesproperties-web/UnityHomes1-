const fs = require('fs');
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
tsconfig.exclude = ["functions", "src/components/dashboards", "src/components/GlobalSearch.tsx", "src/components/DemoPerformanceCenter.tsx"];
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
console.log('Fixed tsconfig.json');
