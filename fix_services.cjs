const fs = require('fs');
let content = fs.readFileSync('src/pages/ServicesPage.tsx', 'utf8');

// Undo the bad ending fragment in ServiceVisual
content = content.replace("    </>);\n  }\n\n  return null;\n}", "    );\n  }\n\n  return null;\n}");

// Add the missing ending fragment to the main function return
content = content.replace("      {/* Final CTA */}\n      \n    </div>\n  );\n}", "      {/* Final CTA */}\n      \n    </div>\n    </>\n  );\n}");

fs.writeFileSync('src/pages/ServicesPage.tsx', content);
console.log('Fixed ServicesPage.tsx successfully');
