import re

with open("src/components/WaitlistRegistration.tsx", "r") as f:
    content = f.read()

old_modal = """              <h3 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] text-center mb-4">
                Help Build Better Area Intelligence
              </h3>
              <p className="text-base text-[var(--color-text-secondary)] text-center mb-8 leading-relaxed">
                If you'd like to help improve future property recommendations, you can spend a few minutes sharing real information about your area.
              </p>"""

new_modal = """              <h3 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] text-center mb-4">
                Would you like to help improve Area Intelligence?
              </h3>
              <p className="text-base text-[var(--color-text-secondary)] text-center mb-8 leading-relaxed">
                Spend just a few minutes sharing information about your area.
              </p>"""

content = content.replace(old_modal, new_modal)

old_success = """        <h3 className="text-3xl font-serif font-bold text-[var(--color-text-primary)] mb-4">Success!</h3>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
          Thank you for joining the Unity Homes Waitlist, together let's build a safe real estate industry.
        </p>"""

new_success = """        <h3 className="text-3xl font-serif font-bold text-[var(--color-text-primary)] mb-4">
          You’re officially on the Unity Homes Waitlist!
        </h3>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-2">
          We’ve sent a confirmation email to your inbox.
        </p>
        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
          Please verify your email to activate your registration.
        </p>
        <div className="flex gap-4 mt-8 justify-center">
          <button className="h-12 px-6 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:opacity-90 transition-all">
            Open Email
          </button>
          <button onClick={() => { window.location.href = '/' }} className="h-12 px-6 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg)] transition-all">
            Return Home
          </button>
        </div>"""

content = content.replace(old_success, new_success)

with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write(content)
