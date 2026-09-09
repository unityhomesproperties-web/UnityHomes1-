const fs = require('fs');
let content = fs.readFileSync('src/pages/AreaIntelligencePage.tsx', 'utf8');
content = content.replace("    </div>\n    </>\n  );\n};", "    </div>\n  );\n};");
fs.writeFileSync('src/pages/AreaIntelligencePage.tsx', content);
