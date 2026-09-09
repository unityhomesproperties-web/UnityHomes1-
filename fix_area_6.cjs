const fs = require('fs');
let content = fs.readFileSync('src/pages/AreaIntelligencePage.tsx', 'utf8');

// The file should just end with:
//     </div>
//   );
// }

const matchIndex = content.lastIndexOf("</>");
if (matchIndex !== -1) {
  content = content.substring(0, matchIndex) + "  );\n}";
}
fs.writeFileSync('src/pages/AreaIntelligencePage.tsx', content);
