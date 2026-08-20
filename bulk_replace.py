import os
import re

directory = "src/components"

replacements = {
    r'bg-stone-50\b': 'bg-[#F4F8F4]',
    r'bg-stone-100\b': 'bg-[#F4F8F4]',
    r'bg-slate-50\b': 'bg-[#F4F8F4]',
    r'bg-slate-100\b': 'bg-[#F4F8F4]',
    r'text-stone-900\b': 'text-[#132A1D]',
    r'text-stone-800\b': 'text-[#132A1D]',
    r'text-stone-700\b': 'text-[#6B7280]',
    r'text-stone-600\b': 'text-[#6B7280]',
    r'text-stone-500\b': 'text-[#6B7280]',
    r'text-slate-800\b': 'text-[#132A1D]',
    r'text-slate-700\b': 'text-[#6B7280]',
    r'text-slate-600\b': 'text-[#6B7280]',
    r'text-slate-500\b': 'text-[#6B7280]',
    r'text-\[\#18452E\]': 'text-[#0E2F1F]',
    r'bg-\[\#18452E\]': 'bg-[#0E2F1F]',
    r'border-stone-200\b': 'border-[#0E2F1F]/[0.08]',
    r'border-stone-100\b': 'border-[#0E2F1F]/[0.08]',
    r'border-slate-200\b': 'border-[#0E2F1F]/[0.08]',
    r'border-slate-100\b': 'border-[#0E2F1F]/[0.08]',
    r'border-\[\#E2E8E4\]': 'border-[#0E2F1F]/[0.08]',
    r'border-\[\#18452E\]/20': 'border-[#0E2F1F]/[0.08]',
    r'border-\[\#18452E\]/40': 'border-[#0E2F1F]/[0.08]'
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

print("Bulk replacement complete.")
