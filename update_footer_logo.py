with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

old_block = """                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <div className="w-6 h-6 bg-[#6FBE45] rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-bold text-black tracking-tight">
                  Unity Homes
                </h3>"""

new_block = """                <img src="/images/Logo.png" alt="Unity Homes Logo" className="h-10 w-auto object-contain transform group-hover:scale-105 transition-transform duration-300" />"""

content = content.replace(old_block, new_block)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
