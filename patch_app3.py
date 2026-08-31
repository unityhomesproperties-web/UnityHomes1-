with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import WaitlistPage from './pages/WaitlistPage';\n", '')
content = content.replace("import DemoMode from './components/DemoMode';\n", '')
content = content.replace('<Route path="/waitlist" element={<WaitlistPage />} />\n', '')
content = content.replace('<DemoMode />\n', '')

# Import WaitlistProvider
content = content.replace(
    "import Layout from './components/Layout';",
    "import Layout from './components/Layout';\nimport { WaitlistProvider } from './components/WaitlistContext';"
)

# Wrap Routes in WaitlistProvider
content = content.replace(
    "<Routes>",
    "<WaitlistProvider>\n      <Routes>"
)
content = content.replace(
    "</Routes>",
    "</Routes>\n      </WaitlistProvider>"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
