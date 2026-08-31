import re
with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useWaitlist } from './WaitlistContext';")

content = content.replace("export default function Footer() {", "export default function Footer() {\n  const { openWaitlist } = useWaitlist();")

# Replace first Link (the CTA button)
content = re.sub(
    r'<Link\s+to="/waitlist"\s+className="inline-flex([^"]+)"\s*>\s*Join the Waitlist\s*<ArrowRight([^>]+)>\s*</Link>',
    r'<button onClick={openWaitlist} className="inline-flex\1">Join the Waitlist<ArrowRight\2></button>',
    content
)

# Replace second Link (Waitlist link in footer menu)
# <FooterLink to="/waitlist">Waitlist</FooterLink>
# Wait, FooterLink is a custom component that expects `to`. We can change it to accept `onClick`.
# Actually, I'll just change that specific link to a button styled like FooterLink.
content = re.sub(
    r'<FooterLink to="/waitlist">Waitlist</FooterLink>',
    r'<button onClick={openWaitlist} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left">Waitlist</button>',
    content
)

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)
