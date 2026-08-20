with open("src/index.css", "r") as f:
    content = f.read()

if "@custom-variant dark" not in content:
    content = '@custom-variant dark (&:is(.dark *));\n' + content

with open("src/index.css", "w") as f:
    f.write(content)
