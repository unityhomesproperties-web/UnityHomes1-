with open("src/components/WaitlistPage.tsx", "r") as f:
    content = f.read()

content = content.replace("import HeroSection from './HeroSection';", "import HeroSection from './HeroSection';\nimport WaitlistRegistration from './WaitlistRegistration';")
content = content.replace("<HeroSection />\n      </main>", "<HeroSection />\n        <WaitlistRegistration />\n      </main>")

with open("src/components/WaitlistPage.tsx", "w") as f:
    f.write(content)
