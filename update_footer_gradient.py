import re

with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

# Replace FooterLink
old_link = """const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-black font-medium hover:text-[#6FBE45] transition-colors duration-300 relative group inline-flex"
  >
    <span>{children}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#6FBE45] transition-all duration-300 group-hover:w-full"></span>
  </Link>
);"""

new_link = """const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="uppercase font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6FBE45] via-white to-black hover:scale-105 transition-all duration-300 relative group inline-flex drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]"
  >
    <span>{children}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#6FBE45] via-white to-black transition-all duration-300 group-hover:w-full"></span>
  </Link>
);"""
content = content.replace(old_link, new_link)

# Replace other text classes
content = content.replace(
    'className="text-black/80 font-medium leading-relaxed max-w-sm text-sm"',
    'className="uppercase font-bold leading-relaxed max-w-sm text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#6FBE45] via-white to-black drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]"'
)

content = content.replace(
    'className="font-bold text-[#18452E] mb-2 text-xs uppercase tracking-[0.2em]"',
    'className="font-extrabold mb-2 text-sm uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#6FBE45] via-white to-black drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]"'
)

content = content.replace(
    'className="text-black font-medium hover:text-[#6FBE45] transition-colors cursor-pointer text-left"',
    'className="uppercase font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6FBE45] via-white to-black hover:scale-105 transition-all duration-300 text-left drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]"'
)

content = content.replace(
    'className="pt-8 border-t border-black/20 flex flex-col md:flex-row justify-between items-center text-xs text-black/70 font-medium tracking-wide"',
    'className="pt-8 border-t border-black/20 flex flex-col md:flex-row justify-between items-center text-xs font-extrabold tracking-wide uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#6FBE45] via-white to-black drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]"'
)

content = content.replace(
    'className="hover:text-[#6FBE45] transition-colors cursor-pointer"',
    'className="hover:scale-110 transition-transform cursor-pointer"'
)

# To ensure the text is VERY visible regardless of the video behind it, we add a very subtle dark overlay
# wait, the user didn't want CSS on the video tag itself. Let's add an overlay DIV behind the text content but over the video.
# Oh, we already have a wrapper <div className="relative z-20 pt-20 pb-10 px-6 lg:px-12">
content = content.replace(
    '<div className="relative z-20 pt-20 pb-10 px-6 lg:px-12">',
    '<div className="absolute inset-0 bg-white/20 z-10 backdrop-blur-[2px]"></div>\\n      <div className="relative z-20 pt-20 pb-10 px-6 lg:px-12 bg-white/10">'
)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
