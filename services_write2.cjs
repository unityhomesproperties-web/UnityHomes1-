const fs = require('fs');

let content = fs.readFileSync('src/pages/ServicesPage.tsx', 'utf-8');
content = content.replace(
  /className=\\{`grid lg:grid-cols-2 gap-12 lg:gap-24 items-center \\\${isEven \? 'lg:rtl' : ''}`\\}/g,
  'className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center"'
);

// We need to inject order classes.
content = content.replace(
  /className=\\{`\\\${isEven \? 'lg:ltr' : ''} space-y-8`\\}\n\s*style=\\{isEven \? \{ direction: 'ltr' \} : \{\}\\}/g,
  'className={`space-y-8 ${isEven ? \'lg:order-last\' : \'lg:order-first\'}`}'
);

content = content.replace(
  /className=\\{`\\\${isEven \? 'lg:ltr' : ''} bg-\\[#F5FAF2\\] rounded-\\[32px\\] p-8 md:p-12 aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200`\\}\n\s*style=\\{isEven \? \{ direction: 'ltr' \} : \{\}\\}/g,
  'className={`bg-[#F5FAF2] rounded-[32px] p-8 md:p-12 aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 ${isEven ? \'lg:order-first\' : \'lg:order-last\'}`}'
);

fs.writeFileSync('src/pages/ServicesPage.tsx', content);
console.log('ServicesPage updated layout');
