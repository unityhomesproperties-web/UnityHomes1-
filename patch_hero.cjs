const fs = require('fs');
let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

const targetSlide = `        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={\`absolute inset-0 flex flex-col-reverse lg:grid lg:grid-cols-2 transition-opacity duration-1000 ease-in-out \${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }\`}
          >
            {/* Content Side */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 py-12 lg:py-0 relative z-20 bg-[var(--color-surface-light)] lg:bg-transparent">
              <div className="max-w-xl mx-auto lg:mx-0 w-full">
                <div className="overflow-hidden mb-6">
                  <div 
                    className={\`inline-flex items-center text-xs uppercase tracking-widest font-semibold text-[var(--color-brand-medium)] transition-all duration-700 delay-100 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    {slide.tag}
                  </div>
                </div>
                
                <div className="overflow-hidden mb-6">
                  <h1 
                    className={\`text-4xl md:text-5xl lg:text-[56px] font-semibold text-[var(--color-brand-deep)] leading-[1.1] transition-all duration-700 delay-200 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    {slide.headline}
                  </h1>
                </div>

                <div className="overflow-hidden mb-10">
                  <p 
                    className={\`text-lg text-[var(--color-text-secondary)] leading-relaxed transition-all duration-700 delay-300 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    {slide.description}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <div 
                    className={\`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-400 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    <button onClick={openWaitlist} className="w-full sm:w-auto bg-[var(--color-brand-fresh)] text-white px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base hover:bg-[var(--color-brand-medium)] transition-colors duration-200 min-h-[48px] flex items-center justify-center shadow-sm cursor-pointer">Join The Waitlist</button>
                    <a
                      href="#services-preview"
                      onClick={scrollToServices}
                      className="w-full sm:w-auto bg-transparent border border-[var(--color-border)] text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base hover:bg-[var(--color-surface-soft)] transition-colors duration-200 min-h-[48px] flex items-center justify-center"
                    >
                      Explore Unity Homes
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative w-full h-[45vh] lg:h-full lg:flex-1 overflow-hidden lg:rounded-bl-[var(--radius-large)] bg-[var(--color-surface-soft)]">
              <img
                src={slide.image}
                alt={slide.headline}
                className={\`w-full h-full object-cover transition-transform duration-[10000ms] ease-out \${
                  idx === currentSlide ? 'scale-105' : 'scale-100'
                }\`}
              />
              {/* Subtle tint instead of dark overlay */}
              
            </div>
          </div>
        ))}`;

const replaceSlide = `        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={\`absolute inset-0 flex flex-col-reverse lg:grid lg:grid-cols-2 transition-opacity duration-1000 ease-in-out \${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }\`}
          >
            {/* Image Side (Absolute on Mobile, Grid item on Desktop) */}
            <div className="absolute inset-0 lg:relative lg:inset-auto w-full h-full lg:flex-1 overflow-hidden lg:rounded-bl-[var(--radius-large)] bg-[var(--color-surface-soft)] z-0">
              <img
                src={slide.image}
                alt={slide.headline}
                className={\`w-full h-full object-cover transition-transform duration-[10000ms] ease-out \${
                  idx === currentSlide ? 'scale-105' : 'scale-100'
                }\`}
              />
              {/* Mobile overlay for text readability */}
              <div className="absolute inset-0 bg-black/60 lg:hidden"></div>
            </div>
            
            {/* Content Side */}
            <div className="flex-1 flex flex-col justify-end pb-24 pt-32 lg:justify-center px-4 sm:px-6 lg:px-16 xl:px-24 lg:py-0 relative z-20 lg:bg-transparent pointer-events-none">
              <div className="max-w-xl mx-auto lg:mx-0 w-full pointer-events-auto">
                <div className="overflow-hidden mb-6">
                  <div 
                    className={\`inline-flex items-center text-xs uppercase tracking-widest font-semibold text-[var(--color-brand-fresh)] lg:text-[var(--color-brand-medium)] transition-all duration-700 delay-100 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    {slide.tag}
                  </div>
                </div>
                
                <div className="overflow-hidden mb-6">
                  <h1 
                    className={\`text-4xl md:text-5xl lg:text-[56px] font-semibold text-white lg:text-[var(--color-brand-deep)] leading-[1.1] transition-all duration-700 delay-200 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    {slide.headline}
                  </h1>
                </div>

                <div className="overflow-hidden mb-10">
                  <p 
                    className={\`text-lg text-white/90 lg:text-[var(--color-text-secondary)] leading-relaxed transition-all duration-700 delay-300 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    {slide.description}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <div 
                    className={\`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-400 \${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }\`}
                  >
                    <button onClick={openWaitlist} className="w-full sm:w-auto bg-[var(--color-brand-fresh)] text-white px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base hover:bg-[var(--color-brand-medium)] transition-colors duration-200 min-h-[48px] flex items-center justify-center shadow-sm cursor-pointer">Join The Waitlist</button>
                    <a
                      href="#services-preview"
                      onClick={scrollToServices}
                      className="w-full sm:w-auto bg-transparent border border-white/30 text-white hover:bg-white/10 lg:border-[var(--color-border)] lg:text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-base lg:hover:bg-[var(--color-surface-soft)] transition-colors duration-200 min-h-[48px] flex items-center justify-center"
                    >
                      Explore Unity Homes
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}`;

content = content.replace(targetSlide, replaceSlide);

const targetControls = `        {/* Hero Controls */}
        <div className="absolute z-30 bottom-0 left-0 lg:w-1/2 px-4 sm:px-6 lg:px-16 xl:px-24 pb-8 lg:pb-12 pointer-events-none">
          <div className="max-w-xl mx-auto lg:mx-0 flex items-center justify-between pointer-events-auto">
            {/* Slide Indicator */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-sm text-[var(--color-brand-deep)] w-5">
                {String(currentSlide + 1).padStart(2, '0')}
              </span>
              
              <div className="w-24 h-[2px] bg-[var(--color-border)] rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[var(--color-brand-fresh)] transition-all duration-[6000ms] ease-linear"
                  style={{ width: \`\${(currentSlide + 1) * (100 / HERO_SLIDES.length)}%\` }}
                />
              </div>
              
              <span className="font-medium text-sm text-[var(--color-text-secondary)] w-5">
                {String(HERO_SLIDES.length).padStart(2, '0')}
              </span>
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-deep)] hover:bg-[var(--color-surface-soft)] transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand-deep)] hover:bg-[var(--color-surface-soft)] transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>`;

const replaceControls = `        {/* Hero Controls */}
        <div className="absolute z-30 bottom-0 left-0 lg:w-1/2 px-4 sm:px-6 lg:px-16 xl:px-24 pb-8 lg:pb-12 pointer-events-none">
          <div className="max-w-xl mx-auto lg:mx-0 flex items-center justify-between pointer-events-auto">
            {/* Slide Indicator */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-sm text-white lg:text-[var(--color-brand-deep)] w-5">
                {String(currentSlide + 1).padStart(2, '0')}
              </span>
              
              <div className="w-24 h-[2px] bg-white/30 lg:bg-[var(--color-border)] rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[var(--color-brand-fresh)] transition-all duration-[6000ms] ease-linear"
                  style={{ width: \`\${(currentSlide + 1) * (100 / HERO_SLIDES.length)}%\` }}
                />
              </div>
              
              <span className="font-medium text-sm text-white/60 lg:text-[var(--color-text-secondary)] w-5">
                {String(HERO_SLIDES.length).padStart(2, '0')}
              </span>
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-white/30 lg:border-[var(--color-border)] flex items-center justify-center text-white lg:text-[var(--color-brand-deep)] hover:bg-white/10 lg:hover:bg-[var(--color-surface-soft)] transition-colors cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-white/30 lg:border-[var(--color-border)] flex items-center justify-center text-white lg:text-[var(--color-brand-deep)] hover:bg-white/10 lg:hover:bg-[var(--color-surface-soft)] transition-colors cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>`;

content = content.replace(targetControls, replaceControls);
fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Mobile hero section updated to full image background.');
