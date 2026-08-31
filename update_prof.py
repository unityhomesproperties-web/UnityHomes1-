import re
with open('src/pages/ProfessionalsPage.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\nimport { useWaitlist } from '../components/WaitlistContext';")

content = content.replace("export default function ProfessionalsPage() {", "export default function ProfessionalsPage() {\n  const { openWaitlist } = useWaitlist();")

content = re.sub(
    r'<Link\s+to="/waitlist"\s+state=\{\{\s*role:\s*prof\.roleId\s*\}\}\s+className="([^"]+)"\s*>\s*Join as a (.+?)\s*<ArrowRight([^>]+)>\s*</Link>',
    r'<button onClick={openWaitlist} className="\1 cursor-pointer">Join as a \2<ArrowRight\3></button>',
    content
)

with open('src/pages/ProfessionalsPage.tsx', 'w') as f:
    f.write(content)
