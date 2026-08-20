import re

with open("src/components/Navigation.tsx", "r") as f:
    content = f.read()

# Replace main logo
pattern1 = r'(id="nav-logo-container"\s*>\s*)<div.*?</div>\s*<div>\s*<span.*?>.*?</span>\s*<span.*?>.*?</span>\s*</div>'
replacement1 = r'\1<div className="h-10 md:h-12 relative flex items-center shrink-0"><img src="/logo.jpg" alt="Unity Homes & Properties Limited" className="h-full w-auto mix-blend-multiply object-contain dark:mix-blend-screen dark:brightness-200 dark:contrast-100" /></div>'
content = re.sub(pattern1, replacement1, content, flags=re.DOTALL)

# Let's find the Footer logo. 
footer_pattern = r'(className="w-8 h-8 md:w-10 md:h-10 bg-white border border-stone-200/80 rounded-xl shadow-xs flex items-center justify-center p-2.*?)<svg.*?</svg>\s*</div>\s*<div>\s*<span.*?>.*?</span>\s*<span.*?>.*?</span>\s*</div>'
footer_replacement = r'className="h-10 relative flex items-center shrink-0"><img src="/logo.jpg" alt="Unity Homes & Properties Limited" className="h-full w-auto mix-blend-multiply object-contain dark:mix-blend-screen dark:brightness-200 dark:contrast-100" /></div>'

content = re.sub(footer_pattern, footer_replacement, content, flags=re.DOTALL)

with open("src/components/Navigation.tsx", "w") as f:
    f.write(content)
