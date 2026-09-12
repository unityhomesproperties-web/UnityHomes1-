const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// 1. Make image absolute on all screen sizes
content = content.replace(
  'className="absolute inset-0 lg:relative lg:inset-auto w-full h-full lg:flex-1 overflow-hidden lg:rounded-bl-[var(--radius-large)] bg-[var(--color-surface-soft)] z-0"',
  'className="absolute inset-0 w-full h-full overflow-hidden bg-[var(--color-surface-soft)] z-0"'
);

// 2. Adjust Content Side layout to be full screen
content = content.replace(
  'className="flex-1 flex flex-col justify-end pb-24 pt-32 lg:justify-center px-4 sm:px-6 lg:px-16 xl:px-24 lg:py-0 relative z-20 lg:bg-transparent pointer-events-none"',
  'className="absolute inset-0 flex flex-col justify-end pb-24 pt-32 lg:justify-center px-4 sm:px-6 lg:px-16 xl:px-24 relative z-20 bg-transparent pointer-events-none"'
);

// 3. Make all text white (removing the lg:text-color overrides)
content = content.replace(
  'text-[var(--color-brand-fresh)] lg:text-[var(--color-brand-medium)]',
  'text-white'
);

content = content.replace(
  'text-white lg:text-[var(--color-brand-deep)] leading-[1.1]',
  'text-white leading-[1.1]'
);

content = content.replace(
  'text-white/90 lg:text-[var(--color-text-secondary)] leading-relaxed',
  'text-white/90 leading-relaxed'
);

content = content.replace(
  'bg-[var(--color-brand-fresh)] text-white px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base hover:bg-[var(--color-brand-medium)]',
  'bg-white text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base hover:bg-stone-50'
);

content = content.replace(
  'bg-transparent border border-white/30 text-white hover:bg-white/10 lg:border-[var(--color-border)] lg:text-[var(--color-brand-deep)] lg:hover:bg-[var(--color-surface-soft)]',
  'bg-transparent border border-white/50 text-white hover:bg-white/10'
);

// Fix controls
content = content.replace(
  'text-white lg:text-[var(--color-brand-deep)] w-5',
  'text-white font-semibold w-5'
);

content = content.replace(
  'bg-white/30 lg:bg-[var(--color-border)] rounded-full',
  'bg-white/30 rounded-full'
);

content = content.replace(
  'text-white/60 lg:text-[var(--color-text-secondary)] w-5',
  'text-white/70 w-5'
);

// Fix arrows (there are two of them, replace globally)
content = content.replace(
  /border border-white\/30 text-white hover:bg-white\/10 lg:border-\[var\(--color-border\)\] lg:text-\[var\(--color-brand-deep\)\] lg:hover:bg-\[var\(--color-surface-soft\)\]/g,
  'border border-white/50 text-white hover:bg-white/10'
);

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('HomePage updated.');
