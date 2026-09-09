const fs = require('fs');
let content = fs.readFileSync('src/pages/AreaIntelligencePage.tsx', 'utf8');

const targetIndex = content.lastIndexOf("</>");
if (targetIndex !== -1) {
  content = content.substring(0, targetIndex) + "</>\n  );\n}";
}
fs.writeFileSync('src/pages/AreaIntelligencePage.tsx', content);
