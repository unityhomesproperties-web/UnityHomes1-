const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// Undo bad patch
content = content.replace("export default function HomePage() {\n  const { openWaitlist } = useWaitlist();\n\n  return (\n    <>\n      <SEO \n        title=\"Unity Homes & Properties Limited | Real Estate in Nigeria\"\n        description=\"Discover verified properties, trusted professionals, and smarter property management in Nigeria with Unity Homes.\"\n      />", 
"export default function HomePage() {\n  const { openWaitlist } = useWaitlist();");

// Apply good patch
content = content.replace("  return (\n    <div className=\"flex flex-col min-h-screen\">", 
"  return (\n    <>\n      <SEO \n        title=\"Unity Homes & Properties Limited | Real Estate in Nigeria\"\n        description=\"Discover verified properties, trusted professionals, and smarter property management in Nigeria with Unity Homes.\"\n      />\n    <div className=\"flex flex-col min-h-screen\">");

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Fixed HomePage.tsx successfully');
