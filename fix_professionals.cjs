const fs = require('fs');
let content = fs.readFileSync('src/pages/ProfessionalsPage.tsx', 'utf8');

// Undo the bad injection in map
content = content.replace("            <>\n      <SEO \n        title=\"For Professionals | Unity Homes\"\n        description=\"Join the Unity Homes network of verified property lawyers, licensed surveyors, and structural engineers.\"\n      />\n      <section ", "            <section ");

// Undo the bad fragment closing at the end of the file
content = content.replace("    </>\n    );\n}", "    </div>\n  );\n}");

// Add the correct injection at the top of the main return
content = content.replace("  return (\n    <div className=\"flex flex-col min-h-screen\">", "  return (\n    <>\n      <SEO \n        title=\"For Professionals | Unity Homes\"\n        description=\"Join the Unity Homes network of verified property lawyers, licensed surveyors, and structural engineers.\"\n      />\n      <div className=\"flex flex-col min-h-screen\">");

fs.writeFileSync('src/pages/ProfessionalsPage.tsx', content);
console.log('Fixed ProfessionalsPage.tsx successfully');
