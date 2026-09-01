with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

content = content.replace("fixed top-0 inset-x-0 z-50", "absolute top-0 inset-x-0 z-50")

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
