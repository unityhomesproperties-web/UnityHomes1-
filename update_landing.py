import re

with open('src/components/LandingPage.tsx', 'r') as f:
    content = f.read()

replacement = """      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-4 md:px-8 py-16 md:py-24 overflow-hidden rounded-b-[40px] mt-24">
        {/* Real Estate Premium Aerial Overlay Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80" 
            alt="Luxury Nigerian Residential Estate" 
            className="w-full h-full object-cover scale-105 transition-transform duration-[10s] ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-[#0E2F1F] opacity-50 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E2F1F]/40 via-transparent to-[#0E2F1F]/70"></div>
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto w-full flex flex-col items-center text-center space-y-12">
          
          <div className="flex flex-col items-center space-y-6 max-w-[800px]">
            {/* Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#0E2F1F] text-white text-[13px] font-[500] tracking-wide shadow-[0_4px_14px_rgba(0,0,0,0.1)] border border-white/10"
            >
              <span className="w-2 h-2 rounded-full bg-[#2F8D46] shadow-[0_0_8px_#2F8D46]"></span>
              <span>Nigeria’s Trusted Property Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[36px] sm:text-[46px] md:text-[72px] font-[800] tracking-tight leading-[1.05]"
            >
              <span className="block text-white">Buy Verified Property</span>
              <span className="block text-[#2F8D46]">Without Fear of Fraud</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 text-[18px] font-[400] leading-relaxed max-w-[640px]"
            >
              We coordinate real-estate transactions with absolute zero-trust verification. Secure your high-end rentals, certified legal advisors, and structural engineers on Nigeria's most rigorous protected routing network.
            </motion.p>
          </div>

          {/* FLOATING SEARCH CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-[900px] bg-black/40 backdrop-blur-xl rounded-[28px] border border-white/10 p-6 md:p-8"
          >
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto scrollbar-hide">
              {(['Buy', 'Rent', 'Land', 'Lease'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-6 text-[16px] font-[600] text-center rounded-[18px] cursor-pointer transition-all duration-300 shrink-0 ${
                    activeTab === tab 
                      ? 'bg-white text-[#132A1D]' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 col-span-1 md:col-span-1 text-left">
                <label className="block text-[13px] font-[600] text-white/70 uppercase tracking-widest pl-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="e.g. Ikoyi, Victoria Island"
                    className="w-full h-[56px] pl-12 pr-4 bg-white rounded-[18px] text-[16px] text-[#132A1D] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2F8D46]"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-1 md:col-span-1 text-left">
                <label className="block text-[13px] font-[600] text-white/70 uppercase tracking-widest pl-2">Property Type</label>
                <select
                  className="w-full h-[56px] px-4 bg-white rounded-[18px] text-[16px] text-[#132A1D] focus:outline-none focus:ring-2 focus:ring-[#2F8D46] appearance-none cursor-pointer"
                  value={filters.propertyType}
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                >
                  <option value="">Any Type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land</option>
                </select>
              </div>
              <div className="space-y-2 col-span-1 md:col-span-1 text-left">
                <label className="block text-[13px] font-[600] text-white/70 uppercase tracking-widest pl-2">Max Price</label>
                <select
                  className="w-full h-[56px] px-4 bg-white rounded-[18px] text-[16px] text-[#132A1D] focus:outline-none focus:ring-2 focus:ring-[#2F8D46] appearance-none cursor-pointer"
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                >
                  <option value="">Any Price</option>
                  <option value="50M">Under ₦50M</option>
                  <option value="100M">Under ₦100M</option>
                  <option value="500M">Under ₦500M</option>
                  <option value="1B">Under ₦1B</option>
                </select>
              </div>
              <div className="col-span-1 md:col-span-1">
                <button
                  type="submit"
                  className="w-full h-[56px] bg-[#2F8D46] hover:bg-[#257338] text-white rounded-[18px] font-[600] text-[16px] shadow-[0_8px_20px_rgba(47,141,70,0.2)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>"""

# Find the start and end of the hero section
start_pattern = r'\{\/\* HERO SECTION \*\/\}.*?<section.*?bg-slate-950 text-white flex flex-col justify-center px-4 md:px-8 py-16 md:py-24 overflow-hidden">'
end_pattern = r'<\/section>'

# Use regex to replace the whole section
pattern = re.compile(r'\{\/\* HERO SECTION \*\/\}\s*<section.*?bg-slate-950.*?</section>', re.DOTALL)
new_content = pattern.sub(replacement, content)

with open('src/components/LandingPage.tsx', 'w') as f:
    f.write(new_content)
