with open("src/index.css", "r") as f:
    content = f.read()

if "Playfair+Display" not in content:
    content = content.replace("family=Inter", "family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter")
    content = content.replace("--font-sans: \"Inter\", system-ui, sans-serif;", "--font-sans: \"Inter\", system-ui, sans-serif;\n  --font-display: \"Playfair Display\", serif;")

with open("src/index.css", "w") as f:
    f.write(content)
