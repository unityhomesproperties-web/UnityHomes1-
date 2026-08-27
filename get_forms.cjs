const fs = require('fs');
let content = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');
const s1 = content.indexOf('{currentStep === 1 && (');
const sEnd = content.indexOf('</motion.div>', s1);
const inner = content.substring(s1, sEnd);
const s2Start = inner.indexOf('{currentStep === 2 && (');

console.log("inner length:", inner.length);
console.log("s2Start:", s2Start);
