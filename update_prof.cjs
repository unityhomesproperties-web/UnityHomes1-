const fs = require('fs');
let content = fs.readFileSync('src/components/ProfessionalsPage.tsx', 'utf8');

content = content.replace(
  /<div className="bg-\[#18452E\] text-white rounded-2xl p-5 md:p-6 mb-8 shadow-md border border-\[#18452E\]\/50 flex flex-col sm:flex-row items-center justify-between gap-4">/,
  `<div className="relative overflow-hidden text-white rounded-2xl p-5 md:p-6 mb-8 shadow-md border border-[#18452E]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80" alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#6FBE45]/90" />
              </div>`
);
content = content.replace(
  /<div className="flex items-center space-x-3\.5 text-center sm:text-left">/,
  `<div className="relative z-10 flex items-center space-x-3.5 text-center sm:text-left">`
);
content = content.replace(
  /<button\s+onClick=\{\(\) => navigate\('\/connect-with-a-professional'\)\}\s+className="/,
  `<button
                onClick={() => navigate('/connect-with-a-professional')}
                className="relative z-10 `
);

fs.writeFileSync('src/components/ProfessionalsPage.tsx', content);
console.log('Updated ProfessionalsPage');
