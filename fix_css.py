import re

with open("src/index.css", "r") as f:
    content = f.read()

content = content.replace(".dark {", "@media (prefers-color-scheme: dark) {\n  :root {")

lines = content.splitlines()
new_lines = []
in_dark = False
for line in lines:
    if "@media (prefers-color-scheme: dark) {" in line:
        in_dark = True
    new_lines.append(line)
    if in_dark and "rgba(255, 255, 255, 0.06);" in line:
        new_lines.append("  }")
        in_dark = False

with open("src/index.css", "w") as f:
    f.write("\n".join(new_lines))
