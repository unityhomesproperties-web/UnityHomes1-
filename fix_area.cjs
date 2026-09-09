const fs = require('fs');
let content = fs.readFileSync('src/pages/AreaIntelligencePage.tsx', 'utf8');

// Undo the bad injection in RadioCard
content = content.replace("  return (\n    <>\n      <SEO \n        title=\"Area Intelligence | Unity Homes\"\n        description=\"Discover deep insights about neighborhoods, infrastructure, and community vibes before making your next property move in Nigeria.\"\n      />\n      <div ", "  return (\n      <div ");

// Undo the bad fragment closing at the end of the file
content = content.replace("    </div>\n      </>\n);", "    </div>\n);");
content = content.replace("    </div>\n    </>\n}", "    </div>\n}"); // just in case

// Add the correct injection at the top of the main return
const mainReturnMatch = "  return (\n    <div className=\"min-h-screen bg-stone-50 flex flex-col font-sans\">";
const newMainReturn = "  return (\n    <>\n      <SEO \n        title=\"Area Intelligence | Unity Homes\"\n        description=\"Discover deep insights about neighborhoods, infrastructure, and community vibes before making your next property move in Nigeria.\"\n      />\n      <div className=\"min-h-screen bg-stone-50 flex flex-col font-sans\">";
if (content.includes(mainReturnMatch)) {
  content = content.replace(mainReturnMatch, newMainReturn);
} else {
  // try regex
  content = content.replace(/(\s*return\s*\(\s*)(<div className="min-h-screen bg-stone-50)/, `$1<>\n      <SEO \n        title=\"Area Intelligence | Unity Homes\"\n        description=\"Discover deep insights about neighborhoods, infrastructure, and community vibes before making your next property move in Nigeria.\"\n      />\n      $2`);
}

// Add the closing fragment to the main function
content = content.replace("      </div>\n    </div>\n  );\n}", "      </div>\n    </div>\n    </>\n  );\n}");

fs.writeFileSync('src/pages/AreaIntelligencePage.tsx', content);
console.log('Fixed AreaIntelligencePage.tsx successfully');
