const fs = require('fs');
const originalFile = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');
const s1 = originalFile.indexOf('{currentStep === 1 && (');
const sEnd = originalFile.indexOf('</motion.div>', s1);
const inner = originalFile.substring(s1, sEnd);
console.log(inner.slice(-100));
