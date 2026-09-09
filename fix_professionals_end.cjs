const fs = require('fs');
let content = fs.readFileSync('src/pages/ProfessionalsPage.tsx', 'utf8');

// Undo the bad ending fragment in structural_engineer return
content = content.replace("      </svg>\n    \n    </>);\n  }\n\n  return null;\n}", "      </svg>\n    );\n  }\n\n  return null;\n}");

// Add the missing ending fragment to the main function return
content = content.replace("      {/* CTA SECTION */}\n      \n    </div>\n  );\n}", "      {/* CTA SECTION */}\n      \n    </div>\n    </>\n  );\n}");
fs.writeFileSync('src/pages/ProfessionalsPage.tsx', content);
console.log('Fixed ProfessionalsPage.tsx ending successfully');
