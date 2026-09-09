const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const seoData = {
  'AboutPage.tsx': { title: 'About Us | Unity Homes', desc: 'Learn about Unity Homes & Properties Limited and our mission to build a safer, more transparent real estate experience in Nigeria.' },
  'AreaIntelligencePage.tsx': { title: 'Area Intelligence | Unity Homes', desc: 'Discover deep insights about neighborhoods, infrastructure, and community vibes before making your next property move in Nigeria.' },
  'ContactPage.tsx': { title: 'Contact Us | Unity Homes', desc: 'Get in touch with Unity Homes & Properties Limited for inquiries about real estate and property management.' },
  'MissionPage.tsx': { title: 'Our Mission | Unity Homes', desc: 'Our mission is to foster secure property transactions and empower real estate decisions through transparent technology.' },
  'VisionPage.tsx': { title: 'Our Vision | Unity Homes', desc: 'Our vision for the future of Nigerian real estate, built on trust, transparency, and technology.' },
  'PrivacyPage.tsx': { title: 'Privacy Policy | Unity Homes', desc: 'Privacy Policy and data protection terms for Unity Homes & Properties Limited.' },
  'ProfessionalsPage.tsx': { title: 'For Professionals | Unity Homes', desc: 'Join the Unity Homes network of verified property lawyers, licensed surveyors, and structural engineers.' },
  'ServicesPage.tsx': { title: 'Our Services | Unity Homes', desc: 'Explore our services: Property Listings, Property Verification, and Professional Connections.' },
  'TermsPage.tsx': { title: 'Terms & Conditions | Unity Homes', desc: 'Terms and Conditions for using Unity Homes & Properties Limited services.' },
  'WaitlistSuccessPage.tsx': { title: 'Success | Unity Homes', desc: 'Thank you for joining the Unity Homes waitlist.' }
};

for (const [file, data] of Object.entries(seoData)) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('import SEO')) continue;

  // Add import
  content = content.replace("import React", "import React"); // Ensure no double
  content = content.replace(/(import .*?;)\n/, `$1\nimport SEO from '../components/SEO';\n`);
  
  // Find main return.
  const returnRegex = /(return\s*\(\s*)(<div|<main|<section)/;
  content = content.replace(returnRegex, `$1<>\n      <SEO \n        title="${data.title}"\n        description="${data.desc}"\n      />\n      $2`);
  
  // Close the fragment at the end of the return
  // We'll just replace the last </div>); or </main>); with </div></>);
  // Since it's a bit tricky, let's just do a simple replace of the last `);` that follows a closing tag.
  const lastIndex = content.lastIndexOf(');');
  if (lastIndex !== -1) {
    const before = content.slice(0, lastIndex);
    const after = content.slice(lastIndex);
    // find last closing tag
    const endTagRegex = /<\/[a-z]+>\s*$/;
    if (endTagRegex.test(before)) {
      content = before + '\n    </>' + after;
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Added SEO to ${file}`);
}
