const fs = require('fs');
let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');

const bannerRegex = /<section className="py-16 bg-\[#C9A84C\] text-\[#18452E\] px-4 md:px-8 w-full border-t border-stone-200">([\s\S]*?)<\/section>/;

const newSection = `<section className="relative py-16 text-white px-4 md:px-8 w-full border-t border-stone-200 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" alt="Architecture Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#6FBE45]/90" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center space-y-6">
          <h2 className="text-3xl md:text-4.5xl font-display font-semibold tracking-tight leading-none max-w-2xl text-white">
            Ready to Navigate the Nigeria Real Estate Market Safely?
          </h2>
          <p className="text-sm text-white max-w-lg leading-relaxed font-normal">
            Contact us to connect with Supreme Court Land Attorneys, request verified site inspections, or configure land verification surveys.
          </p>
          <button 
            onClick={() => navigate('/connect-with-a-professional')}
            className="px-8 py-4 bg-white text-[#18452E] hover:bg-stone-50 rounded-xl font-semibold font-sans tracking-wide shadow-sm flex items-center space-x-2 transition cursor-pointer"
          >
            <span>Get Connected Now</span>
            <ArrowRight className="w-4 h-4 text-[#18452E]" />
          </button>
        </div>
      </section>`;

content = content.replace(bannerRegex, newSection);
fs.writeFileSync('src/components/LandingPage.tsx', content);
console.log('Updated LandingPage.tsx');
