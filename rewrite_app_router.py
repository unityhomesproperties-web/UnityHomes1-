import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove DevMenu import
content = re.sub(r'import \{ DevMenu \} from "\./components/DevMenu";\n?', '', content)

# Update root route to point to waitlist
content = re.sub(
    r'case "/":\s*return <LandingPage navigate=\{navigate\} />;',
    r'case "/":\n        return <WaitlistLandingPage navigate={navigate} />;',
    content
)

# Remove DevMenu rendering
content = re.sub(r'<DevMenu navigate=\{navigate\} />\n?', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
