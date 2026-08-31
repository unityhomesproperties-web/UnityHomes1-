import re
with open('src/pages/ServicesPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useWaitlist } from '../components/WaitlistContext';")
content = content.replace("export default function ServicesPage() {", "export default function ServicesPage() {\n  const { openWaitlist } = useWaitlist();")

content = re.sub(
    r'<Link\s+to="/waitlist"\s+className="([^"]+)"\s*>\s*Join The Waitlist\s*</Link>',
    r'<button onClick={openWaitlist} className="\1 cursor-pointer">Join The Waitlist</button>',
    content
)

with open('src/pages/ServicesPage.tsx', 'w') as f:
    f.write(content)
