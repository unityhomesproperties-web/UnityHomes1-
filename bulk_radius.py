import os
import re

directory = "src/components"

replacements = {
    r'rounded-2xl': 'rounded-[24px]',
    r'rounded-3xl': 'rounded-[28px]',
    r'rounded-xl': 'rounded-[20px]',
    r'shadow-sm': 'shadow-[0_15px_40px_rgba(0,0,0,0.05)]',
    r'shadow-xs': 'shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
}

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)
                
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)

print("Bulk radius replacement complete.")
