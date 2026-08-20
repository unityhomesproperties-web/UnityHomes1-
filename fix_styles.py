import re

with open('src/components/WaitlistLandingPage.tsx', 'r') as f:
    content = f.read()

# Fix hero heading
content = content.replace(
    'className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[1.05] mb-8"',
    'className="font-sans text-[42px] md:text-[56px] lg:text-[72px] font-[800] tracking-tight text-[#132A1D] leading-[1.05] mb-8"'
)

# Fix section heading
content = content.replace(
    'className="font-display text-4xl md:text-5xl font-bold tracking-tight text-stone-900 mb-6"',
    'className="font-sans text-[32px] md:text-[40px] font-[700] tracking-tight text-[#132A1D] mb-6"'
)

# Fix Request Access button (Hero)
content = content.replace(
    'className="w-full sm:w-auto px-8 py-4 bg-stone-900 text-white rounded-full font-semibold text-[15px] hover:bg-[#0E2F1F] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"',
    'className="w-full sm:w-auto px-[28px] h-[56px] bg-[#0E2F1F] text-white rounded-[18px] font-[600] text-[16px] hover:-translate-y-[2px] transition-all duration-250 hover:shadow-[0_8px_20px_rgba(14,47,31,0.15)] flex items-center justify-center space-x-2 group"'
)

# Fix inputs
content = content.replace(
    'w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0E2F1F]/20 focus:border-[#0E2F1F] transition-all',
    'w-full h-[56px] bg-white border border-[#0E2F1F]/[0.08] rounded-[18px] px-[18px] text-[16px] text-[#132A1D] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0E2F1F]/20 focus:border-[#0E2F1F] transition-all'
)

# Fix selects
content = content.replace(
    'w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-[15px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0E2F1F]/20 focus:border-[#0E2F1F] transition-all appearance-none cursor-pointer',
    'w-full h-[56px] bg-white border border-[#0E2F1F]/[0.08] rounded-[18px] px-[18px] text-[16px] text-[#132A1D] focus:outline-none focus:ring-2 focus:ring-[#0E2F1F]/20 focus:border-[#0E2F1F] transition-all appearance-none cursor-pointer'
)

# Fix Roles list
content = content.replace(
    'className={`cursor-pointer rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200 border ${selectedRole === role.id ? \'border-[#0E2F1F] bg-[#0E2F1F]/[0.02] shadow-sm\' : \'border-stone-200 bg-white hover:border-stone-300\'}`}',
    'className={`cursor-pointer rounded-[18px] px-[18px] h-[56px] flex items-center justify-between transition-all duration-250 border hover:-translate-y-[2px] shadow-[0_4px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_15px_rgba(0,0,0,0.05)] ${selectedRole === role.id ? \'border-[#0E2F1F] bg-[#0E2F1F]\' : \'border-[#0E2F1F]/[0.08] bg-white hover:border-[#0E2F1F]/[0.2]\'}`}'
)

content = content.replace(
    '<span className={`text-[15px] ${selectedRole === role.id ? \'font-semibold text-[#0E2F1F]\' : \'font-medium text-stone-600\'}`}>{role.label}</span>',
    '<span className={`text-[16px] ${selectedRole === role.id ? \'font-[600] text-white\' : \'font-[600] text-[#6B7280]\'}`}>{role.label}</span>'
)

content = content.replace(
    '<div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedRole === role.id ? \'border-[#0E2F1F] bg-[#0E2F1F]\' : \'border-stone-300\'}`}>',
    '<div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedRole === role.id ? \'border-transparent\' : \'border-[#0E2F1F]/[0.2]\'}`}>'
)

# Fix Interests List
content = content.replace(
    'className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 border ${selectedInterests.includes(interest.id) ? \'bg-stone-900 border-stone-900 text-white shadow-sm\' : \'bg-white border-stone-200 text-stone-600 hover:border-stone-300\'}`}',
    'className={`px-[24px] h-[48px] rounded-[18px] text-[15px] font-[600] transition-all duration-250 border hover:-translate-y-[2px] shadow-[0_4px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_15px_rgba(0,0,0,0.05)] ${selectedInterests.includes(interest.id) ? \'bg-[#0E2F1F] border-[#0E2F1F] text-white\' : \'bg-white border-[#0E2F1F]/[0.08] text-[#6B7280] hover:border-[#0E2F1F]/[0.2]\'}`}'
)

# Fix primary submit button
content = content.replace(
    'className="w-full bg-stone-900 text-white font-semibold text-[16px] rounded-full py-5 flex items-center justify-center space-x-2 hover:bg-[#0E2F1F] transition-all duration-300 disabled:opacity-70 shadow-md hover:shadow-lg"',
    'className="w-full h-[56px] bg-[#0E2F1F] text-white font-[600] text-[16px] rounded-[18px] px-[28px] hover:-translate-y-[2px] transition-all duration-250 flex items-center justify-center space-x-2 disabled:opacity-70"'
)

# Text updates (font-[400] etc.)
content = content.replace('text-stone-900', 'text-[#132A1D]')
content = content.replace('text-stone-600', 'text-[#6B7280]')
content = content.replace('text-stone-500', 'text-[#6B7280]')

with open('src/components/WaitlistLandingPage.tsx', 'w') as f:
    f.write(content)

print("Updated WaitlistLandingPage.tsx styles")
