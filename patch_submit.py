with open("src/components/AreaIntelligencePage.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "setIsSuccess(true);",
    "setIsSuccess(true);\n    localStorage.removeItem('areaIntelligenceDraft');\n    localStorage.removeItem('areaIntelligenceStep');"
)

with open("src/components/AreaIntelligencePage.tsx", "w") as f:
    f.write(content)
