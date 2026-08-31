import re
with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

# Import the hook
content = content.replace("import { Link, Outlet, useLocation } from 'react-router-dom';", "import { Link, Outlet, useLocation } from 'react-router-dom';\nimport { useWaitlist } from './WaitlistContext';")

# Add the hook to the component
content = content.replace("  const location = useLocation();", "  const location = useLocation();\n  const { openWaitlist } = useWaitlist();")

# Replace first Link
content = re.sub(
    r'<Link\s+to="/waitlist"\s+className="bg-\[var\(--color-brand-fresh\)\] text-white([^"]+)"\s*>\s*Join The Waitlist\s*</Link>',
    r'<button onClick={openWaitlist} className="bg-[var(--color-brand-fresh)] text-white\1 cursor-pointer">Join The Waitlist</button>',
    content
)

# Replace second Link
content = re.sub(
    r'<Link\s+to="/waitlist"\s+onClick=\{closeMenu\}\s+className="bg-\[var\(--color-brand-fresh\)\] text-white([^"]+)"\s*>\s*Join The Waitlist\s*</Link>',
    r'<button onClick={() => { closeMenu(); openWaitlist(); }} className="bg-[var(--color-brand-fresh)] text-white\1 cursor-pointer">Join The Waitlist</button>',
    content
)

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
