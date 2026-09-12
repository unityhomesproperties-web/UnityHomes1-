const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

content = content.replace(
  'className="w-full sm:w-auto bg-transparent border border-white/30 text-white hover:bg-white/10 lg:border-[var(--color-border)] lg:text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base lg:hover:bg-[var(--color-surface-soft)] transition-colors duration-200 min-h-[48px] flex items-center justify-center"',
  'className="w-full sm:w-auto bg-transparent border border-white/50 text-white hover:bg-white/10 px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base transition-colors duration-200 min-h-[48px] flex items-center justify-center"'
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Explore button fixed.');
