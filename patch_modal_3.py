import re
with open('src/components/WaitlistModal.tsx', 'r') as f:
    content = f.read()

# Change useState(0) to useState(1)
content = re.sub(
    r'const \[currentStep, setCurrentStep\] = useState\(0\);',
    r'const [currentStep, setCurrentStep] = useState(1);',
    content
)

# Remove currentStep === 0 block
content = re.sub(
    r'\{\s*currentStep === 0 && \([\s\S]*?\}\s*\{currentStep > 0 && \(',
    r'{currentStep > 0 && (',
    content
)

with open('src/components/WaitlistModal.tsx', 'w') as f:
    f.write(content)
