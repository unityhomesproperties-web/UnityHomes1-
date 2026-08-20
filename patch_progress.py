with open("src/components/AreaIntelligencePage.tsx", "r") as f:
    content = f.read()

new_progress = """  const renderProgress = () => {
    const steps = [
      { id: 1, name: 'Location' },
      { id: 2, name: 'Ratings' },
      { id: 3, name: 'Housing' },
      { id: 4, name: 'Experience' },
      { id: 5, name: 'Review' }
    ];
    const percentage = Math.round(((step - 1) / 4) * 100);
    const estimatedTime = Math.max(1, 4 - Math.floor((step - 1) * (3/4)));
    
    return (
      <div className="w-full max-w-4xl mx-auto mb-12 px-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Progress: {percentage}%</span>
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">~{estimatedTime} min remaining</span>
        </div>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[var(--color-border)] z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--theme-brand-bg)] z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          
          {steps.map((s) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 bg-[var(--color-bg)] px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)]' :
                  isCurrent ? 'bg-[var(--color-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-bg)]' :
                  'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-brand-bg)]"></div> : <div className="w-2.5 h-2.5 rounded-full bg-transparent border border-[var(--color-border)]"></div>}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider hidden md:block ${
                  isCurrent || isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };"""

import re
content = re.sub(r"  const renderProgress = \(\) => \{.*?\n    \);\n  \};", new_progress, content, flags=re.DOTALL)

with open("src/components/AreaIntelligencePage.tsx", "w") as f:
    f.write(content)
