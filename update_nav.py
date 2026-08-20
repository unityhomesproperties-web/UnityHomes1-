import re

with open('src/components/Navigation.tsx', 'r') as f:
    content = f.read()

# Update the header class
replacement_header = '<header className="fixed top-6 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-auto lg:w-[calc(100%-64px)] lg:max-w-7xl lg:mx-auto z-50 bg-white/80 backdrop-blur-xl border border-[#0E2F1F]/[0.06] px-4 py-3 md:px-8 shadow-[0_15px_40px_rgba(0,0,0,0.05)] rounded-[24px]">'
content = re.sub(r'<header className="sticky top-0 z-50[^"]*">', replacement_header, content)

with open('src/components/Navigation.tsx', 'w') as f:
    f.write(content)
