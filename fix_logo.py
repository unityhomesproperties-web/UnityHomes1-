import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

replacement1 = """<img src="/images/logo.png" alt="Unity Homes Logo" className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />"""

replacement2 = """<img src="/images/logo.png" alt="Unity Homes Logo" className="h-8 w-auto object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />"""

content = re.sub(r'<img src="/images/logo.png" alt="Unity Homes Logo" className="h-10 w-auto object-contain" />', replacement1, content)
content = re.sub(r'<img src="/images/logo.png" alt="Unity Homes Logo" className="h-8 w-auto object-contain" />', replacement2, content)

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
