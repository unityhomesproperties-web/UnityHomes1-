const fs = require('fs');

function replaceInFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    for (let r of replacements) {
        content = content.split(r.find).join(r.replace);
    }
    fs.writeFileSync(file, content);
}

replaceInFile('src/components/Layout.tsx', [
    { 
        find: `<Link to="/" className="text-xl font-bold text-[var(--color-brand-deep)]" onClick={closeMenu}>\n              Unity Homes\n            </Link>`, 
        replace: `<Link to="/" className="flex items-center gap-2" onClick={closeMenu}>\n              <img src="/logo.jpg" alt="Unity Homes Logo" className="h-8 w-auto object-contain" />\n            </Link>` 
    }
]);

console.log('Fixed mobile logo in Layout');
