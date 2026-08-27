const fs = require('fs');

const content = fs.readFileSync('/tmp/WaitlistPage.tsx.bak', 'utf8');

const s2 = content.indexOf('{currentStep === 2 && (');
const s3 = content.indexOf('{currentStep === 3 && (');
const s4 = content.indexOf('{currentStep === 4 && (');
const s5 = content.indexOf('{currentStep === 5 && (');
const sEnd = content.indexOf('</AnimatePresence>', s5);

console.log(s2, s3, s4, s5, sEnd);

if(s2 > -1 && s3 > -1 && s4 > -1 && s5 > -1 && sEnd > -1) {
    let form2 = content.substring(s2, s3);
    let form3 = content.substring(s3, s4);
    let form4 = content.substring(s4, s5);
    let form5 = content.substring(s5, sEnd);

    // Write to tmp files to inspect
    fs.writeFileSync('/tmp/f2.txt', form2);
    fs.writeFileSync('/tmp/f3.txt', form3);
    fs.writeFileSync('/tmp/f4.txt', form4);
    fs.writeFileSync('/tmp/f5.txt', form5);
    console.log("Forms extracted");
}
