with open("src/index.css", "r") as f:
    content = f.read()

content = content.replace("@media (prefers-color-scheme: dark) {\n  :root {", ":root.dark {")
content = content.replace("  }\n  }", "  }")

with open("src/index.css", "w") as f:
    f.write(content)
