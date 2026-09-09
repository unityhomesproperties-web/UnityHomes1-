const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const targetStr = `      <header 
        className={\`absolute top-0 inset-x-0 z-50 transition-all duration-300 \${
          isScrolled 
            ? 'bg-white border-b border-[var(--color-border)] py-1 md:py-2 shadow-sm' 
            : 'bg-white border-b border-transparent py-2 md:py-4'
        }\`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/images/Logo.png" alt="Unity Homes Logo" className="h-12 md:h-16 w-auto object-contain scale-110 origin-left" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />
          </Link>`;

const replaceStr = `      <header 
        className={\`absolute top-0 inset-x-0 z-50 transition-all duration-300 flex flex-col \${
          isScrolled 
            ? 'bg-white shadow-sm' 
            : 'bg-white'
        }\`}
      >
        {/* Coming Soon Banner */}
        <div className="bg-[var(--color-brand-deep)] text-white text-xs md:text-sm py-2 px-4 text-center font-medium tracking-wide">
          <span className="opacity-90">Welcome to the Unity Homes early preview.</span> The full platform is launching soon.
        </div>
        <div className={\`transition-all duration-300 border-b \${isScrolled ? 'border-[var(--color-border)] py-1 md:py-2' : 'border-transparent py-2 md:py-4'}\`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img src="/images/Logo.png" alt="Unity Homes Logo" className="h-12 md:h-16 w-auto object-contain scale-110 origin-left" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />
            <span className="hidden sm:inline-flex items-center justify-center bg-[var(--color-brand-fresh)]/10 text-[var(--color-brand-medium)] border border-[var(--color-brand-fresh)]/30 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full whitespace-nowrap">Coming Soon</span>
          </Link>`;

content = content.replace(targetStr, replaceStr);

const targetMobileLogo = `            <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
              <img src="/images/Logo.png" alt="Unity Homes Logo" className="h-12 w-auto object-contain scale-110 origin-left" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />
            </Link>`;

const replaceMobileLogo = `            <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
              <img src="/images/Logo.png" alt="Unity Homes Logo" className="h-12 w-auto object-contain scale-110 origin-left" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />
              <span className="inline-flex items-center justify-center bg-[var(--color-brand-fresh)]/10 text-[var(--color-brand-medium)] border border-[var(--color-brand-fresh)]/30 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full whitespace-nowrap">Coming Soon</span>
            </Link>`;

content = content.replace(targetMobileLogo, replaceMobileLogo);

// Because we added a div wrapper around the header content, we need to close it.
const endHeaderTarget = `        </div>
      </header>`;
const endHeaderReplace = `        </div>
        </div>
      </header>`;
content = content.replace(endHeaderTarget, endHeaderReplace);

fs.writeFileSync('src/components/Layout.tsx', content);
console.log('Added coming soon banner and badge.');
