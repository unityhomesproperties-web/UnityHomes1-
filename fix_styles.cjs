const fs = require('fs');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf-8');
    for (let r of replacements) {
        content = content.split(r.find).join(r.replace);
    }
    fs.writeFileSync(file, content);
}

replaceInFile('src/pages/ProfessionalsPage.tsx', [
    { find: 'bg-white/90 backdrop-blur-md', replace: 'bg-white' },
    { find: 'shadow-lg hover:shadow-xl', replace: 'shadow-sm hover:shadow-md' }
]);

replaceInFile('src/pages/ServicesPage.tsx', [
    { find: 'bg-white/90 backdrop-blur-md', replace: 'bg-white' },
    { find: 'bg-[#132A1D]/40 backdrop-blur-sm', replace: 'bg-[#132A1D]/80' },
    { find: 'shadow-2xl', replace: 'shadow-lg' },
    { find: 'shadow-lg hover:shadow-xl', replace: 'shadow-sm hover:shadow-md' }
]);

replaceInFile('src/pages/AboutPage.tsx', [
    { find: 'shadow-lg hover:shadow-xl', replace: 'shadow-sm hover:shadow-md' }
]);

replaceInFile('src/pages/AreaIntelligencePage.tsx', [
    { find: 'bg-[#2F8D46]/20 backdrop-blur-sm border border-white/20', replace: 'bg-[#132A1D] border-transparent' }
]);

console.log('Fixed styles in pages.');
