const fs = require('fs');
let content = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');

content = content.replace(
    /const ROLES_DISPLAY = \[([\s\S]*?)\];/,
    `const ROLES_DISPLAY = [
  { id: 'property_seeker', title: 'Property Seeker', desc: "I'm looking for property or property-related help.", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80" },
  { id: 'long_term_landlord', title: 'Long-Term Landlord', desc: 'I want to list and/or manage long-term property.', img: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80" },
  { id: 'shortlet_landlord', title: 'Shortlet Landlord', desc: 'I want to list and/or manage shortlet property.', img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80" },
  { id: 'property_management_company', title: 'Property Management Company', desc: 'I manage properties on behalf of clients.', img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" },
  { id: 'property_lawyer', title: 'Property Lawyer', desc: 'I provide legal services for property transactions.', img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80" },
  { id: 'licensed_surveyor', title: 'Licensed Surveyor', desc: 'I provide professional surveying services.', img: "https://images.unsplash.com/photo-1541888086925-ebcf3819e933?auto=format&fit=crop&q=80" },
  { id: 'structural_engineer', title: 'Structural Engineer', desc: 'I provide structural engineering services.', img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80" }
];`
);

console.log(content.indexOf('const NIGERIAN_STATES'));
console.log(content.substring(content.indexOf('const NIGERIAN_STATES'), content.indexOf('const isValidEmail')));
