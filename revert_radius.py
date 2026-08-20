import os
import re

directory = "src/components"

replacements = {
    r'rounded-\[24px\]': 'rounded-2xl',
    r'rounded-\[28px\]': 'rounded-3xl',
    r'rounded-\[20px\]': 'rounded-xl',
    r'shadow-\[0_15px_40px_rgba\(0,0,0,0.05\)\]': 'shadow-sm',
    r'shadow-\[0_10px_30px_rgba\(0,0,0,0.03\)\]': 'shadow-xs'
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

print("Bulk radius revert complete.")
