const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// 1. Tag
content = content.replace(
  'font-semibold text-[var(--color-brand-medium)] transition-all',
  'font-semibold text-[var(--color-brand-fresh)] lg:text-[var(--color-brand-medium)] transition-all'
);

// 2. Headline
content = content.replace(
  'font-semibold text-[var(--color-brand-deep)] leading-[1.1]',
  'font-semibold text-white lg:text-[var(--color-brand-deep)] leading-[1.1]'
);

// 3. Description
content = content.replace(
  'text-lg text-[var(--color-text-secondary)] leading-relaxed',
  'text-lg text-white/90 lg:text-[var(--color-text-secondary)] leading-relaxed'
);

// 4. Explore Button
content = content.replace(
  'bg-transparent border border-[var(--color-border)] text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base hover:bg-[var(--color-surface-soft)]',
  'bg-transparent border border-white/30 text-white hover:bg-white/10 lg:border-[var(--color-border)] lg:text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base lg:hover:bg-[var(--color-surface-soft)]'
);

// 5. Current Slide Indicator
content = content.replace(
  'text-sm text-[var(--color-brand-deep)] w-5',
  'text-sm text-white lg:text-[var(--color-brand-deep)] w-5'
);

// 6. Slide Indicator Bar
content = content.replace(
  'bg-[var(--color-border)] rounded-full relative overflow-hidden',
  'bg-white/30 lg:bg-[var(--color-border)] rounded-full relative overflow-hidden'
);

// 7. Total Slide Indicator
content = content.replace(
  'text-sm text-[var(--color-text-secondary)] w-5',
  'text-sm text-white/60 lg:text-[var(--color-text-secondary)] w-5'
);

// 8. Nav Arrows
// Replace globally (both next and prev buttons)
content = content.replace(
  /border border-\[var\(--color-border\)\] text-\[var\(--color-brand-deep\)\] hover:bg-\[var\(--color-surface-soft\)\]/g,
  'border border-white/30 text-white hover:bg-white/10 lg:border-[var(--color-border)] lg:text-[var(--color-brand-deep)] lg:hover:bg-[var(--color-surface-soft)]'
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Mobile text colors set to white.');
