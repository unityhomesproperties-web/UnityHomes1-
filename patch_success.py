with open("src/components/WaitlistRegistration.tsx", "r") as f:
    content = f.read()

new_success = """  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-6 flex flex-col items-center text-center space-y-5"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--theme-brand-bg)]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="w-16 h-16 bg-[var(--theme-brand-bg)]/10 rounded-full flex items-center justify-center relative z-10 border border-[var(--theme-brand-bg)]/30">
          <CheckCircle2 className="w-8 h-8 text-[var(--theme-brand-bg)]" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">You're on the Waitlist!</h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-[300px] mx-auto leading-relaxed">
          We've sent a confirmation email.
        </p>
      </div>

      <div className="w-full bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl p-6 mt-4 shadow-sm relative overflow-hidden">
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
      </div>
    </motion.div>
  );"""

import re
pattern = re.compile(r"const renderSuccess = \(\) => \(.*?</motion\.div>\n  \);", re.DOTALL)
content = pattern.sub(new_success, content)

with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write(content)
