import re
with open('src/pages/ProfessionalsPage.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<Link\s+to="/waitlist"\s+state=\{\{\s*role:\s*prof\.roleId\s*\}\}\s+className="([^"]+)"\s*>\s*Join The Waitlist\s*<span([^>]+)>→</span>\s*</Link>',
    r'<button onClick={openWaitlist} className="\1 cursor-pointer">Join The Waitlist<span\2>→</span></button>',
    content
)

with open('src/pages/ProfessionalsPage.tsx', 'w') as f:
    f.write(content)
