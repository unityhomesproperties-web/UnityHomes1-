const fs = require('fs');
let content = fs.readFileSync('src/pages/WaitlistPage.tsx', 'utf8');

// Replace deep greens
content = content.replace(/#132A1D/g, '#111827'); // Very dark gray instead of deep green
content = content.replace(/#008D24/g, '#C9A84C'); // Replace the green accent with Gold!
content = content.replace(/#007a1f/g, '#B8973A'); // Darker gold for hover
content = content.replace(/#EAF5E3/g, '#FDFBF4'); // Very light gold/yellow for selected backgrounds

fs.writeFileSync('src/pages/WaitlistPage.tsx', content);
console.log('Fixed waitlist colors');
