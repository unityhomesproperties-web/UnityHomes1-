with open("src/index.css", "r") as f:
    content = f.read()

content = content.replace("--theme-divider: rgba(0, 0, 0, 0.06);", "--theme-divider: rgba(0, 0, 0, 0.06);\n    --theme-brand-icon: var(--color-forest);\n    --theme-brand-text: var(--color-forest);")
content = content.replace("--theme-divider: rgba(255, 255, 255, 0.06);", "--theme-divider: rgba(255, 255, 255, 0.06);\n    --theme-brand-icon: var(--color-soft);\n    --theme-brand-text: var(--color-surface);")

with open("src/index.css", "w") as f:
    f.write(content)
