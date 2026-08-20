with open("src/index.css", "r") as f:
    content = f.read()

content = content.replace("--theme-brand-text: var(--color-forest);", "--theme-brand-text: var(--color-forest);\n    --theme-brand-bg: var(--color-forest);\n    --theme-brand-fg: var(--theme-surface);")
content = content.replace("--theme-brand-text: var(--color-surface);", "--theme-brand-text: var(--color-surface);\n    --theme-brand-bg: var(--color-soft);\n    --theme-brand-fg: var(--color-forest);")

with open("src/index.css", "w") as f:
    f.write(content)
