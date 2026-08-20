with open("src/components/WaitlistRegistration.tsx", "r") as f:
    content = f.read()

# First, revert the inline banner from renderSuccess
content = content.replace("""      <div className="w-full bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl p-6 mt-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--theme-brand-bg)] to-[var(--color-gold)]"></div>
        <h4 className="text-xl font-display font-bold text-[var(--color-text-primary)] mb-3">Help Build Better Area Intelligence</h4>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
          Spend just a few minutes helping buyers, renters and landlords make smarter property decisions across Nigeria.
        </p>
        <div className="space-y-3">
          <button onClick={() => { setShowModal(true); navigateTo('/area-intelligence'); }} className="w-full h-12 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] text-sm font-semibold hover:scale-[1.02] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[var(--theme-brand-bg)]/20">
            Contribute Area Insights <ArrowRight className="w-4 h-4"/>
          </button>
          <button onClick={() => setShowModal(true)} className="w-full h-12 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-semibold hover:bg-[var(--color-surface)] transition-all">
            Skip For Now
          </button>
        </div>
      </div>""", "")

# Also, update the renderSuccess old buttons
content = content.replace("""        <p className="text-sm text-[var(--color-text-secondary)] max-w-[300px] mx-auto leading-relaxed">
          We've sent a confirmation email.
        </p>
      </div>
    </motion.div>""", """        <p className="text-sm text-[var(--color-text-secondary)] max-w-[300px] mx-auto leading-relaxed">
          We've sent a confirmation email.
        </p>
      </div>

      <div className="w-full space-y-3 pt-6">
        <button onClick={() => setShowModal(true)} className="w-full h-14 rounded-xl bg-[var(--theme-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-base font-semibold hover:bg-[var(--color-bg)] transition-all">
          Continue
        </button>
      </div>
    </motion.div>""")

# Update the modal's navigate function
content = content.replace(
    "onClick={() => { setShowModal(false); window.scrollTo(0,0); }} \n                  className=\"w-full h-14 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all\"",
    "onClick={() => { setShowModal(false); navigateTo('/area-intelligence'); }} \n                  className=\"w-full h-14 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all\""
)

# And the other button in modal
content = content.replace(
    "onClick={() => { setShowModal(false); window.scrollTo(0,0); }} \n                  className=\"w-full h-14 rounded-xl bg-transparent text-[var(--color-text-secondary)] font-semibold hover:text-[var(--color-text-primary)] transition-all\"",
    "onClick={() => { setShowModal(false); window.scrollTo(0,0); }} \n                  className=\"w-full h-14 rounded-xl bg-transparent text-[var(--color-text-secondary)] font-semibold hover:text-[var(--color-text-primary)] transition-all\""
)


with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write(content)
