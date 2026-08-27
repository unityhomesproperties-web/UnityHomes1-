const fs = require('fs');
let content = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');

const s1 = content.indexOf('{currentStep === 1 && (');
const sEnd = content.indexOf('</motion.div>', s1);

console.log('s1:', s1, 'sEnd:', sEnd);
console.log(content.substring(s1, sEnd).length);
