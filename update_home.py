import re
with open('src/pages/HomePage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useWaitlist } from '../components/WaitlistContext';")

content = content.replace("export default function HomePage() {", "export default function HomePage() {\n  const { openWaitlist } = useWaitlist();")

content = re.sub(
    r'<Link\s+to="/waitlist"\s+className="([^"]+)"\s*>\s*Join The Waitlist\s*</Link>',
    r'<button onClick={openWaitlist} className="\1 cursor-pointer">Join The Waitlist</button>',
    content
)
content = re.sub(
    r'<Link\s+to="/waitlist"\s+className="([^"]+)"\s*>\s*Join the Waitlist\s*</Link>',
    r'<button onClick={openWaitlist} className="\1 cursor-pointer">Join the Waitlist</button>',
    content
)

with open('src/pages/HomePage.tsx', 'w') as f:
    f.write(content)
