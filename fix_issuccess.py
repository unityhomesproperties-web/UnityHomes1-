with open("src/components/AreaIntelligencePage.tsx", "r") as f:
    content = f.read()

if "const [isSuccess, setIsSuccess]" not in content:
    content = content.replace(
        "const [step, setStep] = useState(() => {",
        "const [isSuccess, setIsSuccess] = useState(false);\n  const [step, setStep] = useState(() => {"
    )

    with open("src/components/AreaIntelligencePage.tsx", "w") as f:
        f.write(content)
