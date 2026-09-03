const fs = require('fs');
let content = fs.readFileSync('src/lib/waitlistService.ts', 'utf8');

// WaitlistRole
content = content.replace(
  "| 'structural_engineer';",
  "| 'structural_engineer'\n  | 'agent';"
);

// ALLOWED_ROLES
content = content.replace(
  "  'structural_engineer'\n];",
  "  'structural_engineer',\n  'agent'\n];"
);

// getBenefitForRole
content = content.replace(
  "    case 'structural_engineer':\n      return 'Founding Professional Badge + 6 Months FREE Verified Listing';",
  "    case 'structural_engineer':\n    case 'agent':\n      return 'Founding Professional Badge + 6 Months FREE Verified Listing';"
);

fs.writeFileSync('src/lib/waitlistService.ts', content);
console.log('Patched waitlistService.ts successfully');
