import re

with open("src/components/Navigation.tsx", "r") as f:
    content = f.read()

pattern = r'<div className="w-9 h-9 bg-white border border-stone-200/80 rounded-xl flex items-center justify-center p-1.5 transition-all duration-300 group-hover:scale-105">\s*<svg.*?</svg>\s*</div>'
replacement = r'<div className="h-10 relative flex items-center shrink-0"><img src="/logo.jpg" alt="Unity Homes & Properties Limited" className="h-full w-auto mix-blend-screen object-contain dark:mix-blend-screen dark:brightness-[100] dark:invert" /></div>'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("src/components/Navigation.tsx", "w") as f:
    f.write(content)
