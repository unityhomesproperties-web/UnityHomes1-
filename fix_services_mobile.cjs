const fs = require('fs');

const file = 'src/pages/ServicesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Make pattern more subtle on mobile
content = content.replace(
  'className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none z-0"',
  'className="absolute inset-0 w-full h-full opacity-[0.03] md:opacity-[0.06] pointer-events-none z-0"'
);

// Reduce motion on mobile? It already uses useReducedMotion.
// But let's also ensure text-balance on H1
content = content.replace(
  'text-[36px] leading-[1.1] md:text-[42px] lg:text-[48px] font-semibold text-white mb-6 lg:mb-8 tracking-tight',
  'text-[36px] leading-[1.1] md:text-[42px] lg:text-[48px] font-semibold text-white mb-6 lg:mb-8 tracking-tight text-balance'
);

fs.writeFileSync(file, content);
