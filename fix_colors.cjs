const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

content = content.replace(
  'text-[var(--color-brand-fresh)] lg:text-[var(--color-brand-medium)]', 
  'text-[var(--color-brand-medium)]'
);

content = content.replace(
  'text-white lg:text-[var(--color-brand-deep)]', 
  'text-[var(--color-brand-deep)]'
);

content = content.replace(
  'text-white/90 lg:text-[var(--color-text-secondary)]', 
  'text-[var(--color-text-secondary)]'
);

content = content.replace(
  'border-white/30 text-white hover:bg-white/10 lg:border-[var(--color-border)] lg:text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base lg:hover:bg-[var(--color-surface-soft)]', 
  'border-[var(--color-border)] text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base hover:bg-[var(--color-surface-soft)]'
);

// Fallback in case of subtle differences
content = content.replace(
  'bg-transparent border border-white/30 text-white hover:bg-white/10 lg:border-[var(--color-border)] lg:text-[var(--color-brand-deep)]',
  'bg-transparent border border-[var(--color-border)] text-[var(--color-brand-deep)]'
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Colors reverted.');
