with open('src/pages/ProfessionalsPage.tsx', 'r') as f:
    content = f.read()
if "import { useWaitlist }" not in content:
    content = content.replace("import { Link, useLocation } from 'react-router-dom';", "import { Link, useLocation } from 'react-router-dom';\nimport { useWaitlist } from '../components/WaitlistContext';")
    with open('src/pages/ProfessionalsPage.tsx', 'w') as f:
        f.write(content)

with open('src/pages/ServicesPage.tsx', 'r') as f:
    content = f.read()
if "import { useWaitlist }" not in content:
    # Check what the import actually is
    import re
    content = re.sub(r'(import \{.*?\} from \'react-router-dom\';)', r'\1\nimport { useWaitlist } from "../components/WaitlistContext";', content)
    with open('src/pages/ServicesPage.tsx', 'w') as f:
        f.write(content)
