import re

with open('src/components/WaitlistLandingPage.tsx', 'r') as f:
    content = f.read()

sections_to_add = """
        {/* SECTION 3: WHY UNITY HOMES */}
        <section className="py-[120px] px-6 md:px-[32px] max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-[80px]">
            <div className="lg:w-1/3">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="lg:sticky lg:top-[120px]"
              >
                <h2 className="text-[32px] md:text-[40px] font-[700] tracking-tight text-[#132A1D] mb-[24px]">
                  Why Unity Homes
                </h2>
                <p className="text-[18px] text-[#6B7280] leading-[1.7] font-[400]">
                  Real estate shouldn't feel like a gamble. We replace ambiguity with data, and fraud with absolute verification.
                </p>
              </motion.div>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-white p-[32px] rounded-[24px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col sm:mt-[40px]"
              >
                <div className="w-[48px] h-[48px] rounded-[16px] bg-[#F4F8F4] flex items-center justify-center mb-[24px]">
                  <ShieldCheck className="w-[24px] h-[24px] text-[#0E2F1F]" />
                </div>
                <h3 className="text-[22px] font-[700] text-[#132A1D] mb-[12px]">Zero Fraud Guarantee</h3>
                <p className="text-[16px] text-[#6B7280] leading-[1.7]">Every property, title, and professional on our network undergoes rigorous verification. Trust is built directly into the operating system.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
                className="bg-white p-[32px] rounded-[24px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col"
              >
                <div className="w-[48px] h-[48px] rounded-[16px] bg-[#F4F8F4] flex items-center justify-center mb-[24px]">
                  <FileText className="w-[24px] h-[24px] text-[#0E2F1F]" />
                </div>
                <h3 className="text-[22px] font-[700] text-[#132A1D] mb-[12px]">Radical Transparency</h3>
                <p className="text-[16px] text-[#6B7280] leading-[1.7]">Immutable payment ledgers, digitized deeds, and clear lease terms. No hidden fees, no document ambiguity.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.35, delay: 0.16, ease: 'easeOut' }}
                className="bg-white p-[32px] rounded-[24px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col sm:mt-[40px]"
              >
                <div className="w-[48px] h-[48px] rounded-[16px] bg-[#F4F8F4] flex items-center justify-center mb-[24px]">
                  <Layers className="w-[24px] h-[24px] text-[#0E2F1F]" />
                </div>
                <h3 className="text-[22px] font-[700] text-[#132A1D] mb-[12px]">Effortless Control</h3>
                <p className="text-[16px] text-[#6B7280] leading-[1.7]">Automate rent collection, tenant screening, and maintenance workflows. An experience designed for serious portfolios.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.35, delay: 0.24, ease: 'easeOut' }}
                className="bg-white p-[32px] rounded-[24px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col"
              >
                <div className="w-[48px] h-[48px] rounded-[16px] bg-[#F4F8F4] flex items-center justify-center mb-[24px]">
                  <Users className="w-[24px] h-[24px] text-[#0E2F1F]" />
                </div>
                <h3 className="text-[22px] font-[700] text-[#132A1D] mb-[12px]">Vetted Network</h3>
                <p className="text-[16px] text-[#6B7280] leading-[1.7]">Access an exclusive network of licensed surveyors, lawyers, and tradespeople. Quality guaranteed on every job.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 4: BUILT FOR */}
        <section className="py-[120px] px-6 md:px-[32px] max-w-[1200px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-center mb-[64px]"
          >
            <h2 className="text-[32px] md:text-[40px] font-[700] tracking-tight text-[#132A1D] mb-[16px]">
              Built for Professionals
            </h2>
            <p className="text-[18px] text-[#6B7280] leading-[1.7] font-[400] max-w-[600px] mx-auto">
              Whether you manage one property or one hundred, the operating system scales to your needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {/* Audience Panel 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="group bg-white rounded-[24px] border border-[#0E2F1F]/[0.08] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600" alt="Long-Term Landlords" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
                <div className="absolute top-[16px] left-[16px] w-[36px] h-[36px] bg-white/90 backdrop-blur-md rounded-[10px] flex items-center justify-center shadow-sm">
                  <Home className="w-[18px] h-[18px] text-[#0E2F1F]" />
                </div>
              </div>
              <div className="p-[24px] flex-1">
                <h3 className="text-[18px] font-[700] text-[#132A1D] mb-[16px]">Long-Term Landlords</h3>
                <ul className="space-y-[12px]">
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Automated rent collection</span>
                  </li>
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Vetted tenant screening</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Audience Panel 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
              className="group bg-white rounded-[24px] border border-[#0E2F1F]/[0.08] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600" alt="Shortlet Operators" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
                <div className="absolute top-[16px] left-[16px] w-[36px] h-[36px] bg-white/90 backdrop-blur-md rounded-[10px] flex items-center justify-center shadow-sm">
                  <Key className="w-[18px] h-[18px] text-[#0E2F1F]" />
                </div>
              </div>
              <div className="p-[24px] flex-1">
                <h3 className="text-[18px] font-[700] text-[#132A1D] mb-[16px]">Shortlet Operators</h3>
                <ul className="space-y-[12px]">
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Unified calendar sync</span>
                  </li>
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Trusted cleaning networks</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Audience Panel 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, delay: 0.16, ease: 'easeOut' }}
              className="group bg-white rounded-[24px] border border-[#0E2F1F]/[0.08] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=600" alt="Property Managers" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
                <div className="absolute top-[16px] left-[16px] w-[36px] h-[36px] bg-white/90 backdrop-blur-md rounded-[10px] flex items-center justify-center shadow-sm">
                  <Building2 className="w-[18px] h-[18px] text-[#0E2F1F]" />
                </div>
              </div>
              <div className="p-[24px] flex-1">
                <h3 className="text-[18px] font-[700] text-[#132A1D] mb-[16px]">Property Managers</h3>
                <ul className="space-y-[12px]">
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Portfolio-wide reporting</span>
                  </li>
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Maintenance dispatch</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Audience Panel 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, delay: 0.24, ease: 'easeOut' }}
              className="group bg-white rounded-[24px] border border-[#0E2F1F]/[0.08] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[6px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600" alt="Professionals" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
                <div className="absolute top-[16px] left-[16px] w-[36px] h-[36px] bg-white/90 backdrop-blur-md rounded-[10px] flex items-center justify-center shadow-sm">
                  <Scale className="w-[18px] h-[18px] text-[#0E2F1F]" />
                </div>
              </div>
              <div className="p-[24px] flex-1">
                <h3 className="text-[18px] font-[700] text-[#132A1D] mb-[16px]">Professionals</h3>
                <ul className="space-y-[12px]">
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Verified deal flow</span>
                  </li>
                  <li className="flex items-start gap-[8px] text-[14px] text-[#6B7280] font-[500] leading-[1.5]">
                    <Check className="w-[16px] h-[16px] text-[#2F8D46] shrink-0 mt-[2px]" />
                    <span>Secure escrow payments</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 5: FOUNDING MEMBER BENEFITS */}
        <section className="py-[120px] px-6 md:px-[32px] max-w-[1200px] mx-auto">
          <div className="text-center mb-[80px]">
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h2 className="text-[32px] md:text-[40px] font-[700] tracking-tight text-[#132A1D] mb-[16px]">
                Founding Member Benefits
              </h2>
              <p className="text-[18px] text-[#6B7280] leading-[1.7] font-[400] max-w-[600px] mx-auto">
                Join the waitlist today to secure exclusive privileges when the platform goes live.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-white p-[40px] rounded-[24px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[4px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col items-start"
            >
              <div className="px-[12px] h-[28px] rounded-full bg-[#F4F8F4] border border-[#C9A84C]/30 text-[#C9A84C] text-[12px] font-[600] uppercase tracking-[0.05em] flex items-center mb-[24px]">
                01
              </div>
              <h3 className="text-[22px] font-[700] text-[#132A1D] mb-[16px] w-full border-b border-[#C9A84C]/20 pb-[16px]">Zero Fees for 6 Months</h3>
              <p className="text-[16px] text-[#6B7280] leading-[1.7]">
                Enjoy complete access to the Unity Homes operating system without any platform fees for your first six months.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
              className="bg-white p-[40px] rounded-[24px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[4px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col items-start"
            >
              <div className="px-[12px] h-[28px] rounded-full bg-[#F4F8F4] border border-[#C9A84C]/30 text-[#C9A84C] text-[12px] font-[600] uppercase tracking-[0.05em] flex items-center mb-[24px]">
                02
              </div>
              <h3 className="text-[22px] font-[700] text-[#132A1D] mb-[16px] w-full border-b border-[#C9A84C]/20 pb-[16px]">Priority Verification</h3>
              <p className="text-[16px] text-[#6B7280] leading-[1.7]">
                Skip the queue. Your properties and professional profile will be fast-tracked through our verification process.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.35, delay: 0.16, ease: 'easeOut' }}
              className="bg-white p-[40px] rounded-[24px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.02)] hover:-translate-y-[4px] hover:shadow-[0_20px_50px_rgba(0,0,0,.06)] transition-all duration-250 flex flex-col items-start"
            >
              <div className="px-[12px] h-[28px] rounded-full bg-[#F4F8F4] border border-[#C9A84C]/30 text-[#C9A84C] text-[12px] font-[600] uppercase tracking-[0.05em] flex items-center mb-[24px]">
                03
              </div>
              <h3 className="text-[22px] font-[700] text-[#132A1D] mb-[16px] w-full border-b border-[#C9A84C]/20 pb-[16px]">Founding Badge</h3>
              <p className="text-[16px] text-[#6B7280] leading-[1.7]">
                A permanent trust signal on your public profile, signaling your early commitment to transparent real estate.
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION 6: DON'T BUY WAHALA */}
        <section className="relative py-[140px] md:py-[200px] bg-[#0E2F1F] overflow-hidden">
          <motion.div 
            initial={{ scale: 1.05 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 10, ease: 'linear' }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
              alt="Premium residential neighborhood" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#0E2F1F]/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2F1F] via-[#0E2F1F]/40 to-transparent"></div>
          </motion.div>

          <div className="relative z-10 px-6 md:px-[32px] max-w-[1200px] mx-auto text-center flex flex-col items-center">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-[48px] md:text-[72px] lg:text-[88px] font-[800] tracking-tight text-[#C9A84C] leading-[1.05] mb-[32px]"
            >
              DON'T BUY WAHALA
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="text-[20px] md:text-[24px] text-white/90 font-[400] max-w-[700px] mx-auto mb-[48px] leading-[1.6]"
            >
              Peace of mind is the ultimate luxury. Join the waitlist today and build your real estate portfolio with absolute certainty.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center gap-[16px] w-full sm:w-auto"
            >
              <button 
                onClick={() => window.open('https://twitter.com', '_blank')}
                className="w-full sm:w-auto px-[32px] h-[56px] bg-white text-[#0E2F1F] rounded-[18px] font-[600] text-[16px] hover:-translate-y-[2px] transition-all duration-250 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
              >
                Follow Our Journey
              </button>
              <button 
                onClick={scrollToForm} 
                className="w-full sm:w-auto px-[32px] h-[56px] bg-[#C9A84C] text-white rounded-[18px] font-[600] text-[16px] hover:-translate-y-[2px] transition-all duration-250 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
              >
                Join Waitlist
              </button>
            </motion.div>
          </div>
        </section>

        {/* SECTION 7: FOUNDER */}
        <section className="py-[120px] px-6 md:px-[32px] max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-[64px] lg:gap-[120px]">
            <motion.div 
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full max-w-[360px] lg:max-w-none lg:w-1/3 flex justify-center lg:justify-end"
            >
              <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full p-[8px] border border-[#C9A84C] relative">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" 
                  alt="Founder" 
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="lg:w-2/3"
            >
              <h3 className="text-[28px] md:text-[36px] font-[700] text-[#132A1D] leading-[1.3] mb-[32px] max-w-[600px]">
                “We are removing the opacity from Nigerian real estate. It's time to build a market where trust is the default, not the exception.”
              </h3>
              
              <div className="mb-[24px]">
                <p className="text-[18px] font-[700] text-[#132A1D] mb-[4px]">Dami Joshua</p>
                <p className="text-[15px] font-[600] text-[#C9A84C] tracking-[0.05em] uppercase">Founder & CEO</p>
              </div>
              
              <div className="space-y-[16px] text-[#6B7280] text-[16px] font-[400] leading-[1.7] max-w-[600px]">
                <p>
                  For too long, acquiring or managing property in Nigeria has been fraught with unnecessary risk. We've normalized friction and accepted uncertainty.
                </p>
                <p>
                  Unity Homes was built to change this paradigm. We are creating an ecosystem where every transaction is verified, every professional is accountable, and every property owner has complete control.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
"""

footer = """
      <footer className="bg-[#0E2F1F] pt-[80px] pb-[40px] px-6 md:px-[32px]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[48px] mb-[80px]">
            <div>
              <div className="flex items-center space-x-3 mb-[24px]">
                <div className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-white text-[#0E2F1F]">
                  <svg viewBox="0 0 24 24" fill="none" className="w-[16px] h-[16px] text-current">
                    <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-[700] text-[20px] tracking-tight text-white">Unity Homes</span>
              </div>
              <p className="text-[14px] text-white/60 leading-[1.6] max-w-[240px]">
                The verified operating system for Nigerian real estate.
              </p>
            </div>
            
            <div>
              <h4 className="text-[14px] font-[600] text-white tracking-[0.05em] uppercase mb-[24px]">Company</h4>
              <ul className="space-y-[16px]">
                <li><a href="#" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">About Us</a></li>
                <li><a href="#" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">Careers</a></li>
                <li><a href="#" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">Press</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[14px] font-[600] text-white tracking-[0.05em] uppercase mb-[24px]">Resources</h4>
              <ul className="space-y-[16px]">
                <li><a href="#" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">Trust & Safety</a></li>
                <li><a href="#" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">Help Center</a></li>
                <li><a href="#" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">Legal</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[14px] font-[600] text-white tracking-[0.05em] uppercase mb-[24px]">Contact</h4>
              <ul className="space-y-[16px]">
                <li><a href="mailto:hello@unityhomes.com" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">hello@unityhomes.com</a></li>
                <li><a href="#" className="text-[15px] text-white/60 hover:text-white transition-colors duration-250">Lagos, Nigeria</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-[40px] flex flex-col md:flex-row items-center justify-between gap-[24px]">
            <p className="text-white/40 text-[14px] font-[500]">
              © {new Date().getFullYear()} Unity Homes & Properties Ltd. All rights reserved.
            </p>
            <p className="text-[#C9A84C] text-[15px] font-[700] tracking-[0.05em] uppercase">
              Don't Buy Wahala.
            </p>
          </div>
        </div>
      </footer>
"""

# Find where to split
main_end_idx = content.find('</main>')
if main_end_idx != -1:
    before_main_end = content[:main_end_idx]
    after_main_end = content[main_end_idx:]
    
    # Let's replace footer inside after_main_end
    # Using regex to find the footer element
    footer_pattern = re.compile(r'<footer.*?</footer>', re.DOTALL)
    after_main_end = re.sub(footer_pattern, footer, after_main_end)
    
    final_content = before_main_end + sections_to_add + after_main_end
    
    with open('src/components/WaitlistLandingPage.tsx', 'w') as f:
        f.write(final_content)
    print("Successfully added new sections and updated footer.")
else:
    print("Could not find </main> tag.")
