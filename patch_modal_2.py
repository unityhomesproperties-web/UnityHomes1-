import re
with open('src/components/WaitlistModal.tsx', 'r') as f:
    content = f.read()

# Make sure if (!isOpen) return null; is there
if "if (!isOpen) return null;" not in content:
    content = content.replace(
        "export default function WaitlistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {",
        "export default function WaitlistModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {\n  if (!isOpen) return null;"
    )

with open('src/components/WaitlistModal.tsx', 'w') as f:
    f.write(content)
