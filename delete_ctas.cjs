const fs = require('fs');

function cleanFile(file, regex) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, '');
  fs.writeFileSync(file, content);
  console.log('Cleaned', file);
}

// HomePage.tsx closing CTA
cleanFile('src/pages/HomePage.tsx', /\{\/\* CLOSING CALL TO ACTION BANNER \*\/\}[\s\S]*?<section[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi);
cleanFile('src/pages/HomePage.tsx', /<section className="relative py-24[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi);

// ProfessionalsPage closing CTA (lines ~300)
cleanFile('src/pages/ProfessionalsPage.tsx', /\{\/\* Premium CTA Banner \*\/\}[\s\S]*?<section[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi);
cleanFile('src/pages/ProfessionalsPage.tsx', /<section className="relative py-24[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi);

// MissionPage closing CTA
cleanFile('src/pages/MissionPage.tsx', /<section className="relative py-24[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi);

// ServicesPage closing CTA
cleanFile('src/pages/ServicesPage.tsx', /<section className="relative py-24[\s\S]*?Join The Waitlist[\s\S]*?<\/section>/gi);

