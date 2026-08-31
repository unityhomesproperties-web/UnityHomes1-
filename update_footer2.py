import re
with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'<Link\s+to="/waitlist"\s+className="([^"]+)"\s*>\s*<span([^>]+)>(.*?)</span>\s*<span([^>]+)>\s*Join The Waitlist\s*<ArrowRight([^>]+)/>\s*</span>\s*</Link>',
    r'<button onClick={openWaitlist} className="\1 cursor-pointer">\n              <span\2>\g<3></span>\n              <span\4>\n                Join The Waitlist\n                <ArrowRight\5/>\n              </span>\n            </button>',
    content, flags=re.DOTALL
)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
