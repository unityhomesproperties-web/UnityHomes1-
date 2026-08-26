const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Typography standardizations
    content = content.replace(/font-extrabold/g, 'font-semibold');
    content = content.replace(/font-black/g, 'font-bold');
    content = content.replace(/font-bold/g, 'font-semibold'); // The prompt says H1/H2 600 (semibold). But buttons are 600. Let's make sure we don't accidentally wipe out 700. Wait, "H1: Inter 600, H2: Inter 600, H3: Inter 500 or 600, Buttons: Inter 600". So almost everything bold should be semibold, except maybe some specific uses.
    
    // Let's do targeted replacements for extreme weights first:
    // Actually just replace all `font-extrabold` and `font-black` with `font-semibold`.
    // And let's find `font-bold` and maybe keep it or change it to `font-semibold`. Let's change `font-bold` to `font-semibold` to be safe, since H1/H2/Buttons are all 600.
    
    if (original !== content) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
