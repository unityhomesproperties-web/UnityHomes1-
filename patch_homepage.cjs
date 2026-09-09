const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');
content = content.replace("import React, { useState, useEffect, useCallback } from 'react';", "import React, { useState, useEffect, useCallback } from 'react';\nimport SEO from '../components/SEO';");
content = content.replace("export default function HomePage() {\n  const { openWaitlist } = useWaitlist();", "export default function HomePage() {\n  const { openWaitlist } = useWaitlist();\n\n  return (\n    <>\n      <SEO \n        title=\"Unity Homes & Properties Limited | Real Estate in Nigeria\"\n        description=\"Discover verified properties, trusted professionals, and smarter property management in Nigeria with Unity Homes.\"\n      />");

// Replace the return block wrapper (need to close the fragment)
content = content.replace("    </div>\n  );\n}", "    </div>\n    </>\n  );\n}");
fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Patched HomePage.tsx successfully');
