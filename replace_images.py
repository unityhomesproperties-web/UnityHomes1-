import os

replacements = {
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80": "/images/our_vision.jpg",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80": "/images/for_real_estate_professionals.jpg",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80": "/images/area_intelligence.jpg",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80": "/images/our_services.jpg",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80": "/images/about_us.jpg",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80": "/images/about_us.jpg",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80": "/images/our_services.jpg",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80": "/images/for_real_estate_professionals.jpg"
}

files_to_check = [
    "src/pages/HomePage.tsx",
    "src/pages/ContactPage.tsx",
    "src/pages/WaitlistSuccessPage.tsx",
    "src/components/LandingPage.tsx",
    "src/components/ProfessionalsPage.tsx"
]

for filepath in files_to_check:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        for old_str, new_str in replacements.items():
            content = content.replace(old_str, new_str)
            
        with open(filepath, 'w') as f:
            f.write(content)

print("Images replaced.")
