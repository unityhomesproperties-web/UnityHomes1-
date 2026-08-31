import re
with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Link, Outlet } from 'react-router-dom';", "import { Link, Outlet } from 'react-router-dom';\nimport { useWaitlist } from './WaitlistContext';")
content = content.replace("export default function Layout() {", "export default function Layout() {\n  const { openWaitlist } = useWaitlist();")

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
