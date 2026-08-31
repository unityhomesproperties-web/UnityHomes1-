with open('src/components/WaitlistModal.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(
    r'</motion\.div>\s*</div>\s*</div>\s*</div>\s*</div>\s*\);\s*\}',
    r'</motion.div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  );\n}',
    content
)

with open('src/components/WaitlistModal.tsx', 'w') as f:
    f.write(content)
