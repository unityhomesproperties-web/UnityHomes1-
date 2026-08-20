import os
import re

directory = "src/components"

replacements = {
    r'bg-\[\#F4F8F4\]': 'bg-stone-50',
    r'text-\[\#132A1D\]': 'text-stone-900',
    r'text-\[\#6B7280\]': 'text-stone-500',
    r'text-\[\#0E2F1F\]': 'text-[#18452E]',
    r'bg-\[\#0E2F1F\]': 'bg-[#18452E]',
    r'border-\[\#0E2F1F\]\/\[0\.08\]': 'border-stone-200',
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

print("Reverse bulk replace complete.")
