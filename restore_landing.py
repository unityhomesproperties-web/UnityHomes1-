import re

with open('src/components/LandingPage.tsx', 'r') as f:
    content = f.read()

original_hero = """      {/* HERO SECTION */}
      <section className="relative min-h-[620px] md:min-h-[680px] bg-slate-950 text-white flex flex-col justify-center px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        {/* Real Estate Premium Aerial Overlay Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80" 
            alt="Premium Aerial Real Estate Nigeria" 
            className="w-full h-full object-cover opacity-30 scale-105 transition-transform duration-[10s] ease-out hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0E2F1F]/95 via-[#0E2F1F]/75 to-[#0F172A]/80"></div>
          {/* Ambient Golden light overlay */}
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Pill Badge */}
            <div className="self-start flex items-center space-x-2 bg-[#18452E]/20 border border-[#18452E]/40 px-4 py-2 rounded-full backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-ping"></span>
              <span className="text-[11px] font-mono tracking-widest font-black text-[#C9A84C] uppercase">
                Nigeria&apos;s Premium Property Operating System
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5.5xl md:text-7xl font-black tracking-tight leading-[1.05] text-white">
              <span className="block">Acquire &amp; Lease Vetted Property</span>
              <span className="block text-[#C9A84C] mt-2 relative inline-block">
                Without Fear of Fraud.
                <span className="absolute left-0 bottom-1 w-full h-[3px] bg-[#C9A84C]/30 rounded"></span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-stone-300 text-sm md:text-base font-light leading-relaxed max-w-xl">
              We coordinate real-estate transactions with absolute zero-trust verification. Secure your high-end rentals, certified legal advisors, and structural engineers on Nigeria&apos;s most rigorous protected routing network.
            </p>

            {/* Quick Contact buttons */}
            <div className="flex flex-wrap gap-4 pt-3">
              <button 
                onClick={() => navigate('/properties')}
                className="px-7 py-4 bg-[#18452E] text-white hover:bg-[#0E2F1F] rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2.5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <span>Browse Verified Properties</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/connect-with-a-professional')}
                className="px-7 py-4 bg-white text-[#0E2F1F] hover:bg-stone-50 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-[#E2E8E4]"
              >
                Hire a Professional
              </button>
              <button 
                onClick={() => navigate('/pricing-and-services')}
                className="px-7 py-4 bg-white text-[#0E2F1F] hover:bg-stone-50 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-[#E2E8E4]"
              >
                Pricing and Services
              </button>
            </div>

          </div>

          <div className="lg:col-span-5 w-full">
            {/* FLOATING SEARCH CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#E2E8E4]/60 overflow-hidden p-6 md:p-7 text-slate-800 relative"
            >
              {/* Premium golden tag accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C9A84C]"></div>

              {/* Five Tabs */}
              <div className="flex space-x-1 border-b border-stone-100 pb-3.5 mb-5 mt-1 overflow-x-auto scrollbar-hide">
                {(['Buy', 'Rent', 'Land', 'Lease'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-3 flex-1 text-xs font-extrabold text-center rounded-lg cursor-pointer transition-all duration-300 uppercase tracking-wider shrink-0 ${
                      activeTab === tab 
                        ? 'bg-[#18452E] text-white shadow-md' 
                        : 'text-[#6B7280] hover:bg-[#F0F8F4]/80 hover:text-[#0E2F1F]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                {/* Mortgage Tab (Coming Soon) */}
                <button
                  className="py-2 px-3 flex-1 text-xs font-extrabold text-center rounded-lg cursor-not-allowed transition-all duration-300 uppercase tracking-wider shrink-0 bg-[#F8FAFC] text-stone-400 border border-stone-200 relative group"
                  onClick={(e) => e.preventDefault()}
                >
                  Mortgage
                  <span className="absolute -top-2 -right-2 bg-[#C9A84C] text-[8px] text-white px-1.5 py-0.5 rounded font-bold shadow-sm whitespace-nowrap">
                    Soon
                  </span>
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Ikoyi, Victoria Island, Maitama"
                      className="w-full pl-10 pr-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Property Type</label>
                    <select 
                      className="w-full px-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all appearance-none cursor-pointer text-slate-700"
                      value={filters.propertyType}
                      onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                    >
                      <option value="">Any Type</option>
                      <option value="House">House / Duplex</option>
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Commercial">Commercial / Office</option>
                      <option value="Land">Land</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Max Price</label>
                    <select 
                      className="w-full px-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all appearance-none cursor-pointer text-slate-700"
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
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-4 bg-[#18452E] hover:bg-[#0E2F1F] text-white rounded-xl font-bold text-sm shadow-[0_8px_20px_rgba(24,69,46,0.25)] transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Search {activeTab} Properties</span>
                </button>
              </form>

            </motion.div>
          </div>

        </div>
      </section>"""

pattern = re.compile(r'\{\/\* HERO SECTION \*\/\}.*?<\/section>', re.DOTALL)
new_content = pattern.sub(original_hero, content)

with open('src/components/LandingPage.tsx', 'w') as f:
    f.write(new_content)
