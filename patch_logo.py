import re

with open('src/components/WaitlistLandingPage.tsx', 'r') as f:
    content = f.read()

# Replace header logo
header_pattern = r'<div className="w-10 h-10 flex items-center justify-center rounded-\[12px\] bg-\[#0E2F1F\] transition-transform duration-250 group-hover:-translate-y-0\.5">.*?<span className="font-\[700\] text-\[22px\] tracking-tight text-\[#132A1D\]">Unity Homes</span>'
header_repl = '<img src="/logo.jpg" alt="Unity Homes Logo" className="h-10 w-auto" />'
content = re.sub(header_pattern, header_repl, content, flags=re.DOTALL)

# Replace footer logo
footer_pattern = r'<div className="w-\[32px\] h-\[32px\] flex items-center justify-center rounded-\[8px\] bg-white text-\[#0E2F1F\]">.*?<span className="font-\[700\] text-\[20px\] tracking-tight text-white">Unity Homes</span>'
footer_repl = '<img src="/logo.jpg" alt="Unity Homes Logo" className="h-8 w-auto bg-white p-1 rounded" />'
content = re.sub(footer_pattern, footer_repl, content, flags=re.DOTALL)

with open('src/components/WaitlistLandingPage.tsx', 'w') as f:
    f.write(content)
