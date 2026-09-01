with open('src/pages/HomePage.tsx', 'r') as f:
    content = f.read()

content = content.replace("h-[100svh] min-h-[600px] lg:h-[85vh]", "h-[100svh] min-h-[600px] lg:h-[100svh]")
# Update h-[45vh] to something larger or maybe the user meant h-full for the hero overall.
# I'll leave h-[45vh] alone unless they meant something else, but lg:h-[100svh] definitely makes it full height.

with open('src/pages/HomePage.tsx', 'w') as f:
    f.write(content)
