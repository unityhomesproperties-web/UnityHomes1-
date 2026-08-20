with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import WaitlistPage from "./components/WaitlistPage";',
    'import WaitlistPage from "./components/WaitlistPage";\nimport AreaIntelligencePage from "./components/AreaIntelligencePage";'
)

with open("src/App.tsx", "w") as f:
    f.write(content)
