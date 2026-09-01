with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = content.replace('object-cover -z-10', 'object-cover z-0')

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
