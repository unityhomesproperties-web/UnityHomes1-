const fs = require('fs');

let content = fs.readFileSync('src/pages/WaitlistPage.tsx', 'utf8');

// The issue is trailing `)}` in the injected forms.
// We can find `)}` that are orphaned just before `</div>` 

content = content.replace(/(\s*)\)\}(\s*<\/div>\s*\)\}\s*\{currentStep === 3)/, '$1$2');
content = content.replace(/(\s*)\)\}(\s*<\/div>\s*\)\}\s*\{currentStep === 4)/, '$1$2');
content = content.replace(/(\s*)\)\}(\s*\{submitError)/, '$1$2');

// Let's use a more robust replacement by just parsing the file and removing `)}` followed by spaces and closing tags where it shouldn't be.
// Better yet, let's just strip `)}` from the end of `form2`, `form3`, `form4` strings in the generator and re-inject.
