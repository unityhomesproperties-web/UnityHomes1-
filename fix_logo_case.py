import os

filepath = 'src/components/Layout.tsx'
if os.path.exists(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace('/images/logo.png', '/images/Logo.png')
    
    with open(filepath, 'w') as f:
        f.write(content)
print("Logo cased.")
