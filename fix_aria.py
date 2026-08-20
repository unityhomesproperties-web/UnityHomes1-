with open("src/components/WaitlistPage.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'onClick={() => setRole(opt)}',
    'onClick={() => setRole(opt)}\n                              aria-pressed={role === opt}'
)

with open("src/components/WaitlistPage.tsx", "w") as f:
    f.write(content)
