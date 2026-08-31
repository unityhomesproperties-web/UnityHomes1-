import re
with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = content.replace("const Footer = () => {", "const Footer = () => {\n  const { openWaitlist } = useWaitlist();")

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
