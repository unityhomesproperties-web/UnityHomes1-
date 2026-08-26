const fs = require('fs');

function replaceInFile(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');
    for (let r of replacements) {
        content = content.split(r.find).join(r.replace);
    }
    fs.writeFileSync(file, content);
}

replaceInFile('src/components/Preloader.tsx', [
    { find: 'const iconVariants: Variants =', replace: 'const iconVariants: any =' },
    { find: 'const textVariants: Variants =', replace: 'const textVariants: any =' },
    { find: 'const lineVariants: Variants =', replace: 'const lineVariants: any =' },
    { find: 'const circleVariants: Variants =', replace: 'const circleVariants: any =' }
]);

replaceInFile('src/components/ShareModal.tsx', [
    { find: 'if (navigator.share) {', replace: 'if (typeof navigator.share === "function") {' }
]);

replaceInFile('src/pages/AreaIntelligencePage.tsx', [
    { find: 'const slideVariants: Variants =', replace: 'const slideVariants: any =' }
]);

replaceInFile('src/lib/database.ts', [
    { find: 'resolve(db);', replace: 'resolve(db as any);' },
    { find: 'resolve(db as any);', replace: 'resolve(db as any);' } // just in case
]);

console.log('Fixed final types');
