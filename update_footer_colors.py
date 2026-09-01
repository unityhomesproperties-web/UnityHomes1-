import re

with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

# Update FooterLink
content = content.replace('text-gray-300 hover:text-white', 'text-black font-medium hover:text-[#6FBE45]')
content = content.replace('bg-white transition-all', 'bg-[#6FBE45] transition-all')

# Update Brand Title
content = content.replace('text-2xl font-bold text-white', 'text-2xl font-bold text-black')

# Update Brand Description
content = content.replace('text-gray-300 leading-relaxed max-w-sm text-sm', 'text-black/80 font-medium leading-relaxed max-w-sm text-sm')

# Update Section Titles (Company, Explore, Legal)
content = content.replace('font-bold text-white mb-2', 'font-bold text-[#18452E] mb-2')

# Update Waitlist Button
content = content.replace('text-gray-300 hover:text-white transition-colors cursor-pointer text-left', 'text-black font-medium hover:text-[#6FBE45] transition-colors cursor-pointer text-left')

# Update Bottom Bar
content = content.replace('text-xs text-gray-400', 'text-xs text-black/70 font-medium')
content = content.replace('border-white/20', 'border-black/20')
content = content.replace('hover:text-white', 'hover:text-[#6FBE45]')

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
