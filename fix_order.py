with open("src/components/WaitlistRegistration.tsx", "r") as f:
    content = f.read()

content = content.replace(
    '<div className="w-full lg:w-[40%] flex flex-col justify-between">',
    '<div className="w-full lg:w-[40%] flex flex-col justify-between order-2 lg:order-1">'
)

content = content.replace(
    '<div className="w-full lg:w-[60%]">',
    '<div className="w-full lg:w-[60%] order-1 lg:order-2">'
)

with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write(content)
