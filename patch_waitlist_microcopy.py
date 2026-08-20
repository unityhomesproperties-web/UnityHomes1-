with open("src/components/WaitlistRegistration.tsx", "r") as f:
    content = f.read()

# Replace 'Continue' with 'Next Step'
content = content.replace("Continue <ArrowRight", "Next Step <ArrowRight")
content = content.replace("Review <ArrowRight", "Review & Submit <ArrowRight")

with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write(content)
