import re
with open('src/components/WaitlistModal.tsx', 'r') as f:
    content = f.read()

# Remove the AnimatePresence and background block
content = re.sub(
    r'<AnimatePresence mode="wait">[\s\S]*?</AnimatePresence>',
    '',
    content
)

# Remove the <div className="relative z-10 w-full flex-grow flex flex-col"> wrapper since we don't need z-10 over a background
content = re.sub(
    r'<div className="relative z-10 w-full flex-grow flex flex-col">',
    r'<div className="w-full flex-grow flex flex-col">',
    content
)

# Also remove the `{currentStep > 0 && (` wrapping the form, since it's always > 0 now
content = re.sub(
    r'\{currentStep > 0 && \(\s*<div className="py-12 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">',
    r'<div className="py-8 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col overflow-y-auto">',
    content
)
# And we need to remove the closing `)}` for it. 
# It was around the end of the return statement.
content = re.sub(
    r'\)\}\s*</div>\n    </div>\n    </div>\n  \);\n\}',
    r'</div>\n    </div>\n    </div>\n  );\n}',
    content
)

with open('src/components/WaitlistModal.tsx', 'w') as f:
    f.write(content)
