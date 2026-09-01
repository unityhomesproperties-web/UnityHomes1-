with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = content.replace('bg-black', 'bg-[#f4f7f5]')

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
