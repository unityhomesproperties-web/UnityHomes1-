with open("src/components/Navigation.tsx", "r") as f:
    content = f.read()

content = content.replace("    { label: 'Waitlist', path: '/waitlist' },\n", "")

old_logo = """            <div className="w-8 h-8 md:w-10 md:h-10 relative flex items-center justify-center shrink-0">
              {/* Unity Homes Monogram Green House/U Combination */}
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#18452E] transition-transform duration-300 group-hover:rotate-3">
                <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="font-display font-black text-lg md:text-xl text-[#18452E] block leading-tight tracking-tight transition-colors duration-300 group-hover:text-[#18452E]">
                Unity Homes
              </span>
              <span className="font-mono text-[9px] tracking-widest text-[#C9A84C] block font-extrabold leading-none uppercase">
                &amp; Properties
              </span>
            </div>"""

new_logo = """            <div className="h-10 md:h-12 relative flex items-center shrink-0">
              <img 
                src="/logo.jpg" 
                alt="Unity Homes & Properties Limited" 
                className="h-full w-auto mix-blend-multiply object-contain dark:mix-blend-screen dark:brightness-[100] dark:invert" 
              />
            </div>"""

if old_logo in content:
    content = content.replace(old_logo, new_logo)

old_footer_logo = """            <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#18452E]">
                <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="font-display font-black text-lg text-[#18452E] block leading-none tracking-tight">
                Unity Homes
              </span>
              <span className="font-mono text-[8px] tracking-widest text-[#C9A84C] block font-bold mt-0.5">
                &amp; Properties
              </span>
            </div>"""

new_footer_logo = """            <div className="h-10 relative flex items-center shrink-0">
              <img 
                src="/logo.jpg" 
                alt="Unity Homes & Properties Limited" 
                className="h-full w-auto mix-blend-multiply object-contain dark:mix-blend-screen dark:brightness-[100] dark:invert" 
              />
            </div>"""

if old_footer_logo in content:
    content = content.replace(old_footer_logo, new_footer_logo)

with open("src/components/Navigation.tsx", "w") as f:
    f.write(content)
