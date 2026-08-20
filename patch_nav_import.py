with open("src/components/WaitlistRegistration.tsx", "r") as f:
    content = f.read()

if "import { navigateTo } from '../utils/navigation';" not in content:
    content = content.replace(
        "import { motion, AnimatePresence } from 'motion/react';",
        "import { motion, AnimatePresence } from 'motion/react';\nimport { navigateTo } from '../utils/navigation';"
    )
    with open("src/components/WaitlistRegistration.tsx", "w") as f:
        f.write(content)
