import re

with open("src/components/WaitlistLandingPage.tsx", "r") as f:
    lines = f.readlines()

import_line = "import WaitlistRegistration from './WaitlistRegistration';\n"
if not any("WaitlistRegistration" in line for line in lines):
    lines.insert(3, import_line)

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '<section id="waitlist-form"' in line:
        start_idx = i
        break

if start_idx != -1:
    # find the matching closing </section>
    # Since we know the next section starts at 407, the closing is at 404
    # let's find it programmatically to be safe
    open_tags = 0
    for i in range(start_idx, len(lines)):
        open_tags += lines[i].count('<section')
        open_tags -= lines[i].count('</section>')
        if open_tags == 0:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    lines = lines[:start_idx] + ["        <WaitlistRegistration />\n"] + lines[end_idx+1:]
    with open("src/components/WaitlistLandingPage.tsx", "w") as f:
        f.writelines(lines)
    print("Replaced section successfully")
else:
    print("Could not find section boundaries")
