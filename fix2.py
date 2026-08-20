import re

with open('src/components/ProfessionalsPage.tsx', 'r') as f:
    content = f.read()

replacement = """              ))}
            </div>
            {/* INDIVIDUAL CHOICE PROMPT MODAL"""

pattern = re.compile(r'\s*\}\)\}\s*\{\/\*\s*INDIVIDUAL CHOICE PROMPT MODAL', re.DOTALL)
new_content = pattern.sub(replacement, content)

with open('src/components/ProfessionalsPage.tsx', 'w') as f:
    f.write(new_content)
