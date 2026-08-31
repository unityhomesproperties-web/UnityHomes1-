import re

with open('src/components/WaitlistModal.tsx', 'r') as f:
    content = f.read()

# Replace the component signature
content = re.sub(
    r'export default function WaitlistPage\(\) \{',
    r'import { X } from "lucide-react";\nexport default function WaitlistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {',
    content
)

# Insert the return early logic right after the first line of the component
content = re.sub(
    r'(export default function WaitlistModal\([^)]+\) \{)',
    r'\1\n  if (!isOpen) return null;\n',
    content
)

# When successful, close modal and navigate
content = re.sub(
    r"navigate\('/waitlist/success'\);",
    r"onClose();\n      navigate('/waitlist/success');",
    content
)

# Convert the outer layout to a modal overlay
# Looking for return ( <div className="min-h-screen font-sans bg-black relative flex flex-col"> ...
content = re.sub(
    r'(return \(\n\s*)<div className="min-h-screen font-sans bg-black relative flex flex-col">',
    r'\1<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">\n      <div className="relative w-full max-w-5xl bg-stone-50 rounded-3xl overflow-hidden shadow-2xl my-auto min-h-[600px] flex flex-col">\n        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 z-50 shadow-sm backdrop-blur-md transition-all hover:scale-105"><X className="w-5 h-5" /></button>',
    content
)

# Remove the step0 which shows a full page background image
content = re.sub(
    r'\{\s*currentStep === 0 && \(\s*<motion\.div[^>]+>\s*<img[^>]+>\s*<div[^>]+>\s*</motion\.div>\s*\)\}',
    '',
    content
)

# Since we wrapped it in another div, we need to close it at the very end
# We'll just replace the last </div>\n    </div>\n  ); with </div>\n    </div>\n    </div>\n  );
content = re.sub(
    r'(</AnimatePresence>\n\s*)</div>\n\s*\);\n\}',
    r'\1</div>\n    </div>\n  );\n}',
    content
)

with open('src/components/WaitlistModal.tsx', 'w') as f:
    f.write(content)
