const fs = require('fs');
const files = ['src/pages/MissionPage.tsx', 'src/pages/WaitlistPage.tsx'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/1504307651254-35680f356f12/g, '1503387762-592deb58ef4e');
    fs.writeFileSync(file, content);
  }
});
