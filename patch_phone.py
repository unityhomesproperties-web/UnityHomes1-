with open("src/components/WaitlistRegistration.tsx", "r") as f:
    content = f.read()

phone_input = """<input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\\d+]/g, '');
                if (val.startsWith('0')) val = '+234' + val.substring(1);
                updateForm({ phone: val });
              }}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:border-[var(--theme-brand-bg)] transition-all"
              placeholder="+234 800 000 0000"
            />"""

content = content.replace("""<input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateForm({ phone: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:border-[var(--theme-brand-bg)] transition-all"
              placeholder="+234 800 000 0000"
            />""", phone_input)

with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write(content)
