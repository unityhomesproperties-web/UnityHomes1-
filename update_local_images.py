import os
import re

def update_file(filepath, replacements):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    for old, new in replacements.items():
        content = re.sub(old, new, content, flags=re.IGNORECASE)
        
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Updated {filepath}")

# Update Pages Hero Images
pages_replacements = {
    'src/pages/AboutPage.tsx': {
        r'https://images.unsplash.com/photo-[^"]+': r'/images/about_us.jpg'
    },
    'src/pages/VisionPage.tsx': {
        r'https://images.unsplash.com/photo-[^"]+': r'/images/our_vision.jpg'
    },
    'src/pages/MissionPage.tsx': {
        r'https://images.unsplash.com/photo-[^"]+': r'/images/our_mission.jpg'
    },
    'src/pages/ServicesPage.tsx': {
        r'https://images.unsplash.com/photo-[^"]+': r'/images/our_services.jpg'
    },
    'src/pages/ProfessionalsPage.tsx': {
        r'https://images.unsplash.com/photo-[^"]+': r'/images/for_real_estate_professionals.jpg'
    },
    'src/pages/AreaIntelligencePage.tsx': {
        r'https://images.unsplash.com/photo-[^"]+': r'/images/area_intelligence.jpg'
    }
}

for filepath, replacements in pages_replacements.items():
    update_file(filepath, replacements)

# Update Waitlist Roles in WaitlistModal.tsx
# The ROLES_DISPLAY array has specific unsplash images. Let's replace them based on ID.
waitlist_modal_path = 'src/components/WaitlistModal.tsx'
if os.path.exists(waitlist_modal_path):
    with open(waitlist_modal_path, 'r') as f:
        content = f.read()
    
    # property_seeker
    content = re.sub(r'(\{ id: \'property_seeker\'.*?img: ")"([^"]+)"(\s*\})', r'\1/images/property_seeker.jpg"\3', content)
    # long_term_landlord
    content = re.sub(r'(\{ id: \'long_term_landlord\'.*?img: ")"([^"]+)"(\s*\})', r'\1/images/long_term_landlord.jpg"\3', content)
    # shortlet_landlord
    content = re.sub(r'(\{ id: \'shortlet_landlord\'.*?img: ")"([^"]+)"(\s*\})', r'\1/images/shortlet_landlord.jpg"\3', content)
    # property_management_company
    content = re.sub(r'(\{ id: \'property_management_company\'.*?img: ")"([^"]+)"(\s*\})', r'\1/images/property_management_company.jpg"\3', content)
    # property_lawyer
    content = re.sub(r'(\{ id: \'property_lawyer\'.*?img: ")"([^"]+)"(\s*\})', r'\1/images/property_lawyer.jpg"\3', content)
    # licensed_surveyor
    content = re.sub(r'(\{ id: \'licensed_surveyor\'.*?img: ")"([^"]+)"(\s*\})', r'\1/images/licensed_surveyor.jpg"\3', content)
    # structural_engineer
    content = re.sub(r'(\{ id: \'structural_engineer\'.*?img: ")"([^"]+)"(\s*\})', r'\1/images/structural_engineer.jpg"\3', content)

    # Waitlist Modal also has default background images:
    content = re.sub(
        r'currentStep === 1 \? "https://images.unsplash.com/[^"]+"',
        r'currentStep === 1 ? "/images/waitlist_step1.jpg"',
        content
    )
    content = re.sub(
        r'currentStep === 2 \? "https://images.unsplash.com/[^"]+"',
        r'currentStep === 2 ? "/images/waitlist_step2.jpg"',
        content
    )
    content = re.sub(
        r'currentStep === 3 \? \(data\.role \? ROLES_DISPLAY\.find\(r => r\.id === data\.role\)\?\.img : "https://images.unsplash.com/[^"]+"\)',
        r'currentStep === 3 ? (data.role ? ROLES_DISPLAY.find(r => r.id === data.role)?.img : "/images/waitlist_step3.jpg")',
        content
    )
    content = re.sub(
        r' :[\s\n]*"https://images.unsplash.com/[^"]+"',
        r' :\n              "/images/waitlist_step4.jpg"',
        content
    )
    
    with open(waitlist_modal_path, 'w') as f:
        f.write(content)
    print(f"Updated {waitlist_modal_path}")

