const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

content = content.replace(
  'bg-white/30 lg:bg-[var(--color-border)]',
  'bg-[var(--color-border)]'
);

content = content.replace(
  'text-white/60 lg:text-[var(--color-text-secondary)]',
  'text-[var(--color-text-secondary)]'
);

content = content.replace(
  'text-white lg:text-[var(--color-brand-deep)] w-5',
  'text-[var(--color-brand-deep)] w-5'
);

content = content.replace(
  'border-white/30 lg:border-[var(--color-border)] flex items-center justify-center text-white lg:text-[var(--color-brand-deep)] hover:bg-white/10 lg:hover:bg-[var(--color-surface-soft)]',
  'border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-deep)] hover:bg-[var(--color-surface-soft)]'
);

content = content.replace(
  'border-white/30 lg:border-[var(--color-border)] flex items-center justify-center text-white lg:text-[var(--color-brand-deep)] hover:bg-white/10 lg:hover:bg-[var(--color-surface-soft)]',
  'border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-deep)] hover:bg-[var(--color-surface-soft)]'
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Control Colors reverted.');
