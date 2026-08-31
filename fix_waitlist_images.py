import re

filepath = 'src/components/WaitlistModal.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = re.sub(
    r'(\{ id: \'property_seeker\'.*?img:\s*)"([^"]+)"(\s*\})', 
    r'\1"/images/property_seeker.jpg"\3', content)

content = re.sub(
    r'(\{ id: \'long_term_landlord\'.*?img:\s*)"([^"]+)"(\s*\})', 
    r'\1"/images/long_term_landlord.jpg"\3', content)

content = re.sub(
    r'(\{ id: \'shortlet_landlord\'.*?img:\s*)"([^"]+)"(\s*\})', 
    r'\1"/images/shortlet_landlord.jpg"\3', content)

content = re.sub(
    r'(\{ id: \'property_management_company\'.*?img:\s*)"([^"]+)"(\s*\})', 
    r'\1"/images/property_management_company.jpg"\3', content)

content = re.sub(
    r'(\{ id: \'property_lawyer\'.*?img:\s*)"([^"]+)"(\s*\})', 
    r'\1"/images/property_lawyer.jpg"\3', content)

content = re.sub(
    r'(\{ id: \'licensed_surveyor\'.*?img:\s*)"([^"]+)"(\s*\})', 
    r'\1"/images/licensed_surveyor.jpg"\3', content)

content = re.sub(
    r'(\{ id: \'structural_engineer\'.*?img:\s*)"([^"]+)"(\s*\})', 
    r'\1"/images/structural_engineer.jpg"\3', content)

with open(filepath, 'w') as f:
    f.write(content)
print("Done")
